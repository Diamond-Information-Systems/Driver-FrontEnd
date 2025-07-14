import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Checkbox,
  Form,
  Row,
  Col,
  Steps,
  Card,
  Radio,
  message,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  HomeOutlined,
  CarOutlined,
  FileImageOutlined,
  SafetyCertificateOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./DriverRegistration.css";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

// SA ID Validation Function
function validateSAID(idNumber) {
  idNumber = idNumber?.replace(/\s/g, "");
  if (idNumber?.length !== 13 || isNaN(idNumber)) {
    return { isValid: false };
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(idNumber.charAt(i));
    if (i % 2 === 0) {
      sum += digit;
    } else {
      sum += digit * 2 >= 10 ? digit * 2 - 9 : digit * 2;
    }
  }

  let checksum = (10 - (sum % 10)) % 10;
  if (parseInt(idNumber.charAt(12)) !== checksum) {
    return { isValid: false };
  }

  let dobYear = parseInt(idNumber.substring(0, 2));
  let currentYear = new Date().getFullYear() % 100;
  let century = dobYear < currentYear ? "20" : "19";
  let yearOfBirth = parseInt(century + idNumber.substring(0, 2));
  let monthOfBirth = parseInt(idNumber.substring(2, 4));
  const monthString = (monthOfBirth < 10 ? "0" : "") + monthOfBirth;
  let dayOfBirth = parseInt(idNumber.substring(4, 6));
  const dayString = (dayOfBirth < 10 ? "0" : "") + dayOfBirth;
  let DOB = yearOfBirth + "-" + monthString + "-" + dayString;
  let genderCode = parseInt(idNumber.charAt(6));
  let gender = genderCode < 5 ? "female" : "male";

  let today = new Date();
  let age = today.getFullYear() - yearOfBirth;
  let month = today.getMonth() + 1;
  if (
    month < monthOfBirth ||
    (month === monthOfBirth && today.getDate() < dayOfBirth)
  ) {
    age--;
  }

  var nationality =
    idNumber.substring(10, 11) === "0"
      ? "SA Citizen"
      : idNumber.substring(10, 11) === "1"
      ? "Permanent Resident"
      : { isValid: false };

  return {
    isValid: true,
    age: age,
    gender: gender,
    dateOfBirth: DOB,
    nationality: nationality,
  };
}

const DriverRegistration = ({ onRegister, onBackToLogin }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identificationType: "sa_id",
    dateOfBirth: null,
    autoFilledFromId: false,
  });

  const provinces = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
  ];

  const vehicleTypes = [
    { value: "VayeGo", label: "VayeGo - Hatchback (Affordable rides)" },
    { value: "VayeX", label: "VayeX - Sedan (Standard rides)" },
    { value: "VayeComfort", label: "VayeComfort - Premium sedan" },
    { value: "VayeXL", label: "VayeXL - Minivan (6+ passengers)" },
    { value: "VayeBlack", label: "VayeBlack - Luxury sedan" },
  ];

  const handleIdNumberChange = (value) => {
    if (formData.identificationType === "sa_id" && value) {
      const validation = validateSAID(value);
      if (validation.isValid) {
        const birthDate = dayjs(validation.dateOfBirth);
        form.setFieldsValue({
          dateOfBirth: birthDate,
        });
        setFormData((prev) => ({
          ...prev,
          dateOfBirth: birthDate,
          autoFilledFromId: true,
          extractedAge: validation.age,
          extractedGender: validation.gender,
          extractedNationality: validation.nationality,
        }));

        if (validation.age < 21) {
          message.warning(
            "You must be at least 21 years old to register as a driver"
          );
        } else {
          message.success("ID validated successfully");
        }
      }
    }
  };

  const validateStep = async (step) => {
    try {
      const values = await form.validateFields();

      // Additional validation for step 0 (Personal Info)
      if (step === 0) {
        if (formData.identificationType === "sa_id") {
          const validation = validateSAID(values.idNumber);
          if (!validation.isValid) {
            message.error("Please enter a valid South African ID number");
            return false;
          }
          if (validation.age < 21) {
            message.error("You must be at least 21 years old to register");
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.log("Validation failed:", error);
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onRegister({ ...values, ...formData });
        message.success("Registration completed successfully!");
      }, 2000);
    } catch (error) {
      console.log("Form submission failed:", error);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File must be smaller than 10MB!");
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  const steps = [
    {
      title: "Personal",
      content: (
        <Card className="step-card">
          <Title level={3} className="step-title">
            Personal Information
          </Title>
          <Text className="step-subtitle">Tell us about yourself</Text>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: "First name is required" }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="First Name"
                  className="custom-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: "Last name is required" }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="Last Name"
                  className="custom-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="Email Address"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern: /^(\+27|0)[0-9]{9}$/,
                message: "Enter valid SA phone number",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<PhoneOutlined />}
              placeholder="Phone Number (e.g., +27 81 234 5678)"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item label="Identification Type">
            <Radio.Group
              value={formData.identificationType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  identificationType: e.target.value,
                }))
              }
              className="id-type-radio"
            >
              <Radio value="sa_id">South African ID</Radio>
              <Radio value="passport">Passport</Radio>
            </Radio.Group>
          </Form.Item>

          {formData.identificationType === "sa_id" ? (
            <Form.Item
              name="idNumber"
              rules={[{ required: true, message: "ID number is required" }]}
            >
              <Input
                size="large"
                prefix={<IdcardOutlined />}
                placeholder="South African ID Number"
                className="custom-input"
                onChange={(e) => handleIdNumberChange(e.target.value)}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="passportNumber"
              rules={[
                { required: true, message: "Passport number is required" },
              ]}
            >
              <Input
                size="large"
                prefix={<IdcardOutlined />}
                placeholder="Passport Number"
                className="custom-input"
              />
            </Form.Item>
          )}

          <Form.Item
            name="dateOfBirth"
            rules={[{ required: true, message: "Date of birth is required" }]}
          >
            <DatePicker
              size="large"
              placeholder="Date of Birth"
              className="custom-input"
              style={{ width: "100%" }}
              disabled={formData.autoFilledFromId}
              disabledDate={(current) => {
                const age = dayjs().diff(current, "year");
                return age < 21;
              }}
            />
          </Form.Item>

          {formData.autoFilledFromId && (
            <div className="id-info-card">
              <Text type="success">
                ✓ Information extracted from ID: Age {formData.extractedAge},
                {formData.extractedGender}, {formData.extractedNationality}
              </Text>
            </div>
          )}
        </Card>
      ),
    },
    {
      title: "Address",
      content: (
        <Card className="step-card">
          <Title level={3} className="step-title">
            Address & Login Details
          </Title>
          <Text className="step-subtitle">
            Where do you live and how will you sign in?
          </Text>

          <Form.Item
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input
              size="large"
              prefix={<HomeOutlined />}
              placeholder="Street Address"
              className="custom-input"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                rules={[{ required: true, message: "City is required" }]}
              >
                <Input
                  size="large"
                  placeholder="City"
                  className="custom-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="province"
                rules={[{ required: true, message: "Province is required" }]}
              >
                <Select
                  size="large"
                  placeholder="Select Province"
                  className="custom-select"
                >
                  {provinces.map((province) => (
                    <Option key={province} value={province}>
                      {province}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="postalCode">
            <Input
              size="large"
              placeholder="Postal Code"
              className="custom-input"
            />
          </Form.Item>

          <div className="form-divider">
            <span style={{ marginTop: "-10%" }}>Login Credentials</span>
          </div>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Create Password"
              className="custom-input"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Confirm Password"
              className="custom-input"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </Card>
      ),
    },
    {
      title: "Vehicle",
      content: (
        <Card className="step-card">
          <Title level={3} className="step-title">
            Vehicle Information
          </Title>
          <Text className="step-subtitle">Tell us about your vehicle</Text>

          <Form.Item
            name="vehicleType"
            rules={[{ required: true, message: "Vehicle type is required" }]}
            initialValue="VayeX"
          >
            <Select
              size="large"
              placeholder="Select Vehicle Type"
              className="custom-select"
            >
              {vehicleTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="vehicleMake"
            rules={[{ required: true, message: "Vehicle make is required" }]}
          >
            <Input
              size="large"
              prefix={<CarOutlined />}
              placeholder="Vehicle Make (e.g., Toyota)"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="vehicleModel"
            rules={[{ required: true, message: "Vehicle model is required" }]}
          >
            <Input
              size="large"
              placeholder="Vehicle Model (e.g., Corolla)"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="vehicleYear"
            rules={[
              { required: true, message: "Vehicle year is required" },
              {
                validator: (_, value) => {
                  if (value && parseInt(value) < 2022) {
                    return Promise.reject("Vehicle must be 2022 or newer");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select size="large" placeholder="Year" className="custom-select">
              {[2025, 2024, 2023, 2022].map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="vehicleColor">
            <Input size="large" placeholder="Color" className="custom-input" />
          </Form.Item>

          <Form.Item
            name="licensePlate"
            rules={[{ required: true, message: "License plate is required" }]}
          >
            <Input
              size="large"
              placeholder="License Plate Number"
              className="custom-input"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <div className="vehicle-requirements">
            <Title level={4}>Vehicle Requirements:</Title>
            <ul>
              <li>✓ 4 doors with seats for at least 4 passengers</li>
              <li>✓ 2022 or newer model year</li>
              <li>✓ ABS and airbags (driver and passenger)</li>
              <li>✓ No cosmetic damage</li>
              <li>✓ Commercial vehicle insurance required</li>
            </ul>
          </div>
        </Card>
      ),
    },
    {
      title: "Documents",
      content: (
        <Card className="step-card">
          <Title level={3} className="step-title">
            Upload Documents
          </Title>
          <Text className="step-subtitle">
            Please upload clear, original documents (no photocopies)
          </Text>

          <div className="document-list">
            <div className="document-item">
              <div className="document-header">
                <FileImageOutlined />
                <span>Profile Photo</span>
              </div>
              <Form.Item
                name="profilePhoto"
                rules={[
                  { required: true, message: "Profile photo is required" },
                ]}
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Photo</div>
                  </div>
                </Upload>
              </Form.Item>
              <Text type="secondary" className="document-hint">
                Clear headshot, no hats or sunglasses
              </Text>
            </div>

            <div className="document-item">
              <div className="document-header">
                <IdcardOutlined />
                <span>
                  {formData.identificationType === "sa_id"
                    ? "South African ID"
                    : "Passport"}
                </span>
              </div>
              <Form.Item
                name="idDocument"
                rules={[{ required: true, message: "ID document is required" }]}
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload ID</div>
                  </div>
                </Upload>
              </Form.Item>
              <Text type="secondary" className="document-hint">
                {formData.identificationType === "sa_id"
                  ? "Both sides of your green ID book or smart card"
                  : "Passport photo page and visa/permit if applicable"}
              </Text>
            </div>

            <div className="document-item">
              <div className="document-header">
                <SafetyCertificateOutlined />
                <span>Professional Driving Permit (PrDP)</span>
              </div>
              <Form.Item
                name="driversLicense"
                rules={[{ required: true, message: "PrDP is required" }]}
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload PrDP</div>
                  </div>
                </Upload>
              </Form.Item>
              <Text type="secondary" className="document-hint">
                Valid South African Professional driving permit
              </Text>
            </div>

            <div className="document-item">
              <div className="document-header">
                <CarOutlined />
                <span>Vehicle Registration</span>
              </div>
              <Form.Item
                name="vehicleRegistration"
                rules={[
                  {
                    required: true,
                    message: "Vehicle registration is required",
                  },
                ]}
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Registration</div>
                  </div>
                </Upload>
              </Form.Item>
              <Text type="secondary" className="document-hint">
                Vehicle registration certificate
              </Text>
            </div>
          </div>

          <div className="next-steps-info">
            <Title level={4}>Next Steps After Registration:</Title>
            <ul>
              <li>
                • Complete safety screening at Post Net, Jetline, or HURU
                partner
              </li>
              <li>• Vehicle inspection at DEKRA approved center</li>
              <li>
                • Apply for operating license through Department of Transport
              </li>
              <li>• Attend driver information session</li>
            </ul>
          </div>
        </Card>
      ),
    },
    {
      title: "Review",
      content: (
        <Card className="step-card">
          <Title level={3} className="step-title">
            Review & Agreement
          </Title>
          <Text className="step-subtitle">
            Please review and accept our terms
          </Text>

          <div className="agreements-section">
            <Form.Item
              name="termsAccepted"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject("You must accept the terms"),
                },
              ]}
            >
              <Checkbox className="agreement-checkbox">
                I accept the{" "}
                <a href="#" className="link">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="link">
                  Privacy Policy
                </a>
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="dataProcessingAccepted"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject("You must consent to data processing"),
                },
              ]}
            >
              <Checkbox className="agreement-checkbox">
                I consent to the processing of my personal data for driver
                verification and platform operations
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="backgroundCheckConsent"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject("You must consent to background check"),
                },
              ]}
            >
              <Checkbox className="agreement-checkbox">
                I consent to background screening and safety checks as required
                by Vaye
              </Checkbox>
            </Form.Item>
          </div>
        </Card>
      ),
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="registration-wrapper">
      <div className="registration-background">
        <div className="registration-container">
          {/* Header positioned over car image */}
          <div className="registration-header">
            <div className="logo-container">
              <CarOutlined className="logo-icon" />
            </div>
            {/* <Text className="registration-subtitle">Start driving and earning today</Text> */}
          </div>

          {/* Car Image Section */}
          <div className="car-image-section">
            <div className="car-image-container">
              {/* Replace src with your actual car image path */}
              <img
                src="/images/car3.1.png"
                alt="Vaye Car"
                className="car-image"
              />
            </div>
          </div>

          {/* Gradient Transition */}
          <div className="car-to-form-transition"></div>

          {/* Form Section - Solid Background */}
          <div className="form-section">
            {/* Steps */}
            <Steps
              current={currentStep}
              className="registration-steps"
              direction="horizontal"
              size="small"
              style={{ marginTop: "-50%" }}
            >
              {steps.map((step, index) => (
                <Step key={index} title={step.title} />
              ))}
            </Steps>

            {/* Form */}
            <Form
              form={form}
              layout="vertical"
              className="registration-form"
              onFinish={handleSubmit}
            >
              <div className="step-content">{steps[currentStep].content}</div>

              {/* Navigation */}
              <div className="form-navigation">
                {currentStep > 0 && (
                  <Button
                    size="large"
                    onClick={prevStep}
                    className="nav-button secondary"
                  >
                    Previous
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    size="large"
                    type="primary"
                    onClick={nextStep}
                    className="nav-button primary"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="large"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="nav-button primary"
                  >
                    Complete Registration
                  </Button>
                )}
              </div>
            </Form>

            {/* Back to Login */}
            <div className="back-to-login">
              <Text>
                Already have an account?
                <Button
                  type="link"
                  onClick={() => navigate("/")}
                  className="login-link"
                >
                  Sign in here
                </Button>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;
