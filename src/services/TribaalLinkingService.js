import { useAuth } from "../context/AuthContext";



class TribaalLinkingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.endpoints = {
      linkAccount: '/account-linking/link-account',
      linkStatus: '/account-linking/link-status',
      walletBalance: '/account-linking/wallet/balance',
      processPayment: '/account-linking/wallet/payment',
      syncWallet: '/account-linking/wallet/sync',
      disconnect: '/account-linking/disconnect'
    };
    
    // Event listeners for state changes
    this.stateChangeListeners = [];
    this.currentState = null;
  }

  // EVENT SYSTEM FOR STATE MANAGEMENT
  onStateChange(callback) {
    this.stateChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.stateChangeListeners.indexOf(callback);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  notifyStateChange(newState) {
    const oldState = this.currentState;
    this.currentState = newState;
    
    this.stateChangeListeners.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  // ENHANCED API METHODS
 getAuthToken() {
  const token = localStorage.getItem('token');
  console.log("TribaalLinkingService token:", token); // <-- Add this line
  return token;
}

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  async linkTribaalAccount(email, password, token) {
  try {
    this.notifyStateChange({
      status: 'linking',
      message: 'Connecting to Tribaal account...',
      progress: 0
    });

    const response = await fetch(`${this.baseURL}${this.endpoints.linkAccount}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      this.notifyStateChange({
        status: 'error',
        message: data.message || 'Failed to link account',
        errorCode: data.errorCode
      });
      throw new Error(data.message || 'Failed to link account');
    }
    this.notifyStateChange({
      status: 'linked',
      message: data.message,
      data: data.data,
      linkStatus: data.data.linkStatus,
      subStatus: data.data.subStatus,
      statusDisplay: data.data.statusDisplay
    });
    return data;
  } catch (error) {
    this.notifyStateChange({
      status: 'error',
      message: error.message,
      error: error
    });
    throw error;
  }
}

  async getLinkStatus(token) {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.linkStatus}`, {
        method: 'GET',
        headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get link status');
      }

      // Update current state
      this.notifyStateChange({
        status: data.data.isLinked ? 'linked' : 'not_linked',
        linkStatus: data.data.linkStatus,
        subStatus: data.data.subStatus,
        statusDisplay: data.data.statusDisplay,
        data: data.data,
        canReconnect: data.data.canReconnect,
        hasErrors: data.data.hasErrors
      });

      return data;
    } catch (error) {
      this.notifyStateChange({
        status: 'error',
        message: error.message,
        error: error
      });
      throw error;
    }
  }

  async disconnectAccount(token,reason = 'User requested') {
    try {
      console.log('🔌 Disconnecting Tribaal account...');
      
      this.notifyStateChange({
        status: 'disconnecting',
        message: 'Disconnecting account...'
      });

      const response = await fetch(`${this.baseURL}${this.endpoints.disconnect}`, {
        method: 'DELETE',
            headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to disconnect account');
      }

      this.notifyStateChange({
        status: 'disconnected',
        message: data.message,
        data: data.data,
        canReconnect: data.data.canReconnect
      });

      return data;
    } catch (error) {
      this.notifyStateChange({
        status: 'error',
        message: error.message,
        error: error
      });
      throw error;
    }
  }

  async syncWallet(token) {
  try {
    this.notifyStateChange({
      status: 'syncing',
      message: 'Syncing wallet data...'
    });

    const response = await fetch(`${this.baseURL}${this.endpoints.syncWallet}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Wallet sync failed');
    }
    this.notifyStateChange({
      status: 'synced',
      message: data.message,
      data: data.data
    });
    return data;
  } catch (error) {
    this.notifyStateChange({
      status: 'sync_error',
      message: error.message,
      error: error
    });
    throw error;
  }
}

 async getWalletBalance(token, mobile) {
  const response = await fetch(`${this.baseURL}/wallet/balance-enquiry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      transactorMobile: mobile,
      currency: 'ZWG',
      channel: 'USSD'
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get wallet balance');
  }
  return data;
}

 async processPayment(token, amount, description, rideId = null, metadata = {}) {
  try {
    const response = await fetch(`${this.baseURL}${this.endpoints.processPayment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, description, rideId, metadata })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Payment processing failed');
    }
    return data;
  } catch (error) {
    throw new Error(`Payment failed: ${error.message}`);
  }
}

  // UTILITY METHODS
  formatCurrency(amount, currency = 'ZWG') {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

async isAccountLinked(token) {
  try {
    const status = await this.getLinkStatus(token);
    return status.data.isLinked && status.data.linkStatus === 'active';
  } catch (error) {
    return false;
  }
}

  getStatusColor(linkStatus, subStatus) {
    const statusColors = {
      'active': '#10B981', // green
      'pending': '#F59E0B', // amber
      'disconnected': '#6B7280', // gray
      'error': '#EF4444', // red
      'suspended': '#F59E0B', // amber
      'expired': '#F59E0B', // amber
      'revoked': '#DC2626' // dark red
    };
    
    return statusColors[linkStatus] || '#6B7280';
  }

  getStatusIcon(linkStatus, subStatus) {
    const statusIcons = {
      'active': '✓',
      'pending': '⏳',
      'disconnected': '⊘',
      'error': '⚠',
      'suspended': '⏸',
      'expired': '⏰',
      'revoked': '✕'
    };
    
    return statusIcons[linkStatus] || '?';
  }
}

// Export singleton instance
export default new TribaalLinkingService();