// Location clustering and route optimization utilities
// These are frontend helpers that complement the backend smart routing

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

/**
 * Cluster delivery jobs by pickup location proximity
 * @param {Array} jobs - Array of delivery job objects
 * @param {number} maxDistance - Maximum distance in km to consider jobs in same cluster
 * @returns {Array} Array of clusters with grouped jobs
 */
export function clusterJobsByLocation(jobs, maxDistance = 0.5) {
  const clusters = [];
  const processedJobs = new Set();

  jobs.forEach(job => {
    if (processedJobs.has(job.deliveryId)) return;

    const cluster = {
      id: `cluster_${clusters.length + 1}`,
      centerLocation: {
        latitude: job.pickup.latitude,
        longitude: job.pickup.longitude,
        address: job.pickup.address,
        businessName: job.pickup.businessName
      },
      jobs: [job],
      radius: 0,
      totalEarnings: parseFloat(job.estimatedEarnings) || 0,
      averageDistance: parseFloat(job.estimatedDistance) || 0
    };

    processedJobs.add(job.deliveryId);

    // Find nearby jobs for this cluster
    jobs.forEach(otherJob => {
      if (processedJobs.has(otherJob.deliveryId)) return;

      const distance = calculateDistance(
        job.pickup.latitude,
        job.pickup.longitude,
        otherJob.pickup.latitude,
        otherJob.pickup.longitude
      );

      if (distance <= maxDistance) {
        cluster.jobs.push(otherJob);
        cluster.totalEarnings += parseFloat(otherJob.estimatedEarnings) || 0;
        cluster.radius = Math.max(cluster.radius, distance);
        processedJobs.add(otherJob.deliveryId);
      }
    });

    // Calculate average distance for the cluster
    cluster.averageDistance = cluster.jobs.reduce((sum, j) => 
      sum + (parseFloat(j.estimatedDistance) || 0), 0) / cluster.jobs.length;

    clusters.push(cluster);
  });

  // Sort clusters by potential earnings (descending)
  return clusters.sort((a, b) => b.totalEarnings - a.totalEarnings);
}

/**
 * Calculate route optimization metrics for selected jobs
 * @param {Array} selectedJobs - Array of selected delivery jobs
 * @param {Object} driverLocation - Driver's current location {latitude, longitude}
 * @returns {Object} Route optimization metrics
 */
export function calculateRouteMetrics(selectedJobs, driverLocation = null) {
  if (selectedJobs.length === 0) return null;

  // Group by pickup locations
  const pickupGroups = {};
  selectedJobs.forEach(job => {
    const locationKey = `${job.pickup.latitude},${job.pickup.longitude}`;
    if (!pickupGroups[locationKey]) {
      pickupGroups[locationKey] = {
        location: job.pickup,
        jobs: []
      };
    }
    pickupGroups[locationKey].jobs.push(job);
  });

  const pickupLocations = Object.values(pickupGroups);

  // Calculate total metrics
  const totalEarnings = selectedJobs.reduce((sum, job) => 
    sum + (parseFloat(job.estimatedEarnings) || 0), 0);
  
  // Estimate individual trip distances (if jobs were done separately)
  const individualTotalDistance = selectedJobs.reduce((sum, job) => 
    sum + (parseFloat(job.estimatedDistance) || 0), 0);

  // Estimate optimized route distance (simplified calculation)
  let optimizedDistance = 0;
  if (driverLocation && pickupLocations.length > 0) {
    // Distance from driver to first pickup
    optimizedDistance += calculateDistance(
      driverLocation.latitude,
      driverLocation.longitude,
      pickupLocations[0].location.latitude,
      pickupLocations[0].location.longitude
    );

    // Distance between pickup locations
    for (let i = 0; i < pickupLocations.length - 1; i++) {
      optimizedDistance += calculateDistance(
        pickupLocations[i].location.latitude,
        pickupLocations[i].location.longitude,
        pickupLocations[i + 1].location.latitude,
        pickupLocations[i + 1].location.longitude
      );
    }

    // Distance from pickup locations to delivery locations (simplified)
    pickupLocations.forEach(group => {
      group.jobs.forEach(job => {
        optimizedDistance += calculateDistance(
          group.location.latitude,
          group.location.longitude,
          job.dropoff.latitude,
          job.dropoff.longitude
        );
      });
    });
  } else {
    // Fallback: use average of individual distances with 15% optimization
    optimizedDistance = individualTotalDistance * 0.85;
  }

  // Calculate savings
  const distanceSaved = Math.max(0, individualTotalDistance - optimizedDistance);
  const timeSaved = distanceSaved * 2; // Rough estimate: 2 minutes per km saved
  const fuelSaved = distanceSaved * 0.08; // Rough estimate: $0.08 per km fuel cost
  const efficiencyGain = individualTotalDistance > 0 ? 
    (distanceSaved / individualTotalDistance) * 100 : 0;

  return {
    totalJobs: selectedJobs.length,
    uniquePickupLocations: pickupLocations.length,
    totalEarnings,
    individualTotalDistance,
    optimizedDistance,
    distanceSaved,
    timeSaved,
    fuelSaved,
    efficiencyGain,
    pickupGroups: pickupLocations,
    estimatedTimeMinutes: optimizedDistance * 3 // Rough estimate: 3 minutes per km
  };
}

/**
 * Generate smart job combination suggestions
 * @param {Array} jobs - Available delivery jobs
 * @param {Object} driverLocation - Driver's current location
 * @param {Object} options - Configuration options
 * @returns {Array} Array of suggested job combinations
 */
export function generateSmartCombinations(jobs, driverLocation = null, options = {}) {
  const {
    maxJobsPerCombination = 5,
    maxDistance = 1.0,
    minEarnings = 10,
    maxCombinations = 5
  } = options;

  const combinations = [];
  
  // First, create clusters
  const clusters = clusterJobsByLocation(jobs, maxDistance);

  // Generate combinations from clusters
  clusters.forEach(cluster => {
    if (cluster.jobs.length >= 2 && cluster.totalEarnings >= minEarnings) {
      // Create combinations of different sizes from this cluster
      for (let size = 2; size <= Math.min(cluster.jobs.length, maxJobsPerCombination); size++) {
        const combination = {
          id: `combo_${cluster.id}_${size}`,
          jobs: cluster.jobs.slice(0, size),
          clusterId: cluster.id,
          metrics: calculateRouteMetrics(cluster.jobs.slice(0, size), driverLocation),
          reason: `${size} deliveries from same pickup location`,
          priority: cluster.totalEarnings / size // Earnings per job
        };

        combinations.push(combination);
      }
    }
  });

  // Add cross-cluster combinations for nearby clusters
  for (let i = 0; i < clusters.length - 1; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      const cluster1 = clusters[i];
      const cluster2 = clusters[j];
      
      const distanceBetweenClusters = calculateDistance(
        cluster1.centerLocation.latitude,
        cluster1.centerLocation.longitude,
        cluster2.centerLocation.latitude,
        cluster2.centerLocation.longitude
      );

      if (distanceBetweenClusters <= maxDistance * 2) {
        const combinedJobs = [...cluster1.jobs.slice(0, 2), ...cluster2.jobs.slice(0, 2)];
        
        if (combinedJobs.length <= maxJobsPerCombination) {
          const combination = {
            id: `combo_${cluster1.id}_${cluster2.id}`,
            jobs: combinedJobs,
            clusterIds: [cluster1.id, cluster2.id],
            metrics: calculateRouteMetrics(combinedJobs, driverLocation),
            reason: `Nearby pickup locations (${distanceBetweenClusters.toFixed(1)}km apart)`,
            priority: (cluster1.totalEarnings + cluster2.totalEarnings) / combinedJobs.length
          };

          combinations.push(combination);
        }
      }
    }
  }

  // Sort by priority and return top combinations
  return combinations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxCombinations)
    .map(combo => ({
      ...combo,
      savings: combo.metrics ? {
        distance: combo.metrics.distanceSaved,
        time: combo.metrics.timeSaved,
        fuel: combo.metrics.fuelSaved,
        efficiency: combo.metrics.efficiencyGain
      } : null
    }));
}

/**
 * Optimize delivery route order for multiple stops
 * @param {Array} pickupLocations - Array of pickup location groups
 * @param {Object} driverLocation - Driver's current location
 * @returns {Array} Optimized order of pickup locations
 */
export function optimizeRouteOrder(pickupLocations, driverLocation = null) {
  if (pickupLocations.length <= 1) return pickupLocations;

  // Simple nearest neighbor algorithm
  const optimizedOrder = [];
  const remaining = [...pickupLocations];
  let currentLocation = driverLocation;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    remaining.forEach((location, index) => {
      const distance = currentLocation ? 
        calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          location.location.latitude,
          location.location.longitude
        ) : 0;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearest = remaining.splice(nearestIndex, 1)[0];
    optimizedOrder.push(nearest);
    currentLocation = nearest.location;
  }

  return optimizedOrder;
}
