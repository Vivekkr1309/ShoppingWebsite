/// Authentication Management
const Auth = {
    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // Get all registered users from localStorage
    getRegisteredUsers: () => {
        return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    },

    // Save users to localStorage
    saveRegisteredUsers: (users) => {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    },

    // Get current user data
    getCurrentUser: () => {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    // Login function
    login: async (mobile, password) => {
        // Validation
        if (!Utils.validateMobile(mobile)) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }
        
        if (password.length < 4) {
            throw new Error('Password must be at least 4 characters long');
        }

        try {
            // Get registered users from localStorage
            const registeredUsers = Auth.getRegisteredUsers();
            
            // Find user by mobile number
            const user = registeredUsers.find(u => u.mobile_number === mobile);
            
            if (!user) {
                throw new Error('Mobile number not registered. Please register first.');
            }
            
            // Check password
            if (user.password !== password) {
                throw new Error('Invalid password. Please try again.');
            }
            
            // Store user data in session
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', 'user_token_' + Date.now());
            
            Utils.showNotification('Login successful! Welcome back!', 'success');
            return user;
        } catch (error) {
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    },

    // Registration function
    register: async (userData) => {
        // Validation
        if (userData.name.length < 3) {
            throw new Error('Name must be at least 3 characters long');
        }
        
        if (!Utils.validateEmail(userData.email)) {
            throw new Error('Please enter a valid email address');
        }
        
        if (!Utils.validateMobile(userData.mobile_number)) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }
        
        if (userData.password.length < 4) {
            throw new Error('Password must be at least 4 characters long');
        }
        
        if (userData.password !== userData.confirm_password) {
            throw new Error('Passwords do not match');
        }

        try {
            // Get existing registered users
            const registeredUsers = Auth.getRegisteredUsers();
            
            // Check if mobile number already exists
            const existingMobile = registeredUsers.find(u => u.mobile_number === userData.mobile_number);
            if (existingMobile) {
                throw new Error('Mobile number already registered. Please use a different number or login.');
            }
            
            // Check if email already exists
            const existingEmail = registeredUsers.find(u => u.email === userData.email);
            if (existingEmail) {
                throw new Error('Email already registered. Please use a different email.');
            }
            
            // Create new user object
            const newUser = {
                user_id: 'user_' + Date.now(),
                name: userData.name,
                email: userData.email,
                mobile_number: userData.mobile_number,
                address: userData.address,
                password: userData.password, // In real app, this should be hashed
                registered_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            
            // Add new user to registered users
            registeredUsers.push(newUser);
            Auth.saveRegisteredUsers(registeredUsers);
            
            // Auto-login after successful registration
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            localStorage.setItem('authToken', 'user_token_' + Date.now());
            
            Utils.showNotification('Registration successful! Welcome to ShopEasy!', 'success');
            return newUser;
        } catch (error) {
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    },

    // Logout function
    logout: () => {
        // Clear session data but keep registered users
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        
        Utils.showScreen('login-screen');
        Utils.showNotification('Logged out successfully', 'info');
    },

    // Forgot password - step 1
    forgotPassword: async (mobile, email) => {
        if (!Utils.validateMobile(mobile)) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }
        
        if (!Utils.validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        try {
            // Get registered users
            const registeredUsers = Auth.getRegisteredUsers();
            
            // Find user by mobile and email
            const user = registeredUsers.find(u => 
                u.mobile_number === mobile && u.email === email
            );
            
            if (!user) {
                throw new Error('No account found with this mobile number and email combination.');
            }
            
            // Generate OTP (in real app, this would be sent via email/SMS)
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Store OTP and mobile for verification
            localStorage.setItem('resetOtp', otp);
            localStorage.setItem('resetMobile', mobile);
            localStorage.setItem('otpExpiry', (Date.now() + 10 * 60 * 1000).toString()); // 10 minutes expiry
            
            // Simulate OTP sending delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show OTP in notification for demo purposes
            Utils.showNotification(`OTP sent to your registered email: ${otp} (Demo OTP)`, 'info');
            return true;
        } catch (error) {
            throw new Error(error.message || 'Failed to send OTP. Please try again.');
        }
    },

    // Reset password - step 2
    resetPassword: async (otp, newPassword, confirmPassword) => {
        if (newPassword.length < 4) {
            throw new Error('Password must be at least 4 characters long');
        }

        if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        try {
            // Get stored OTP data
            const storedOtp = localStorage.getItem('resetOtp');
            const resetMobile = localStorage.getItem('resetMobile');
            const otpExpiry = localStorage.getItem('otpExpiry');
            
            // Check if OTP session exists
            if (!storedOtp || !resetMobile || !otpExpiry) {
                throw new Error('OTP session expired. Please request a new OTP.');
            }
            
            // Check if OTP has expired
            if (Date.now() > parseInt(otpExpiry)) {
                localStorage.removeItem('resetOtp');
                localStorage.removeItem('resetMobile');
                localStorage.removeItem('otpExpiry');
                throw new Error('OTP has expired. Please request a new OTP.');
            }
            
            // Verify OTP
            if (storedOtp !== otp) {
                throw new Error('Invalid OTP. Please check and try again.');
            }
            
            // Update password in registered users
            const registeredUsers = Auth.getRegisteredUsers();
            const userIndex = registeredUsers.findIndex(u => u.mobile_number === resetMobile);
            
            if (userIndex === -1) {
                throw new Error('User account not found.');
            }
            
            // Update password
            registeredUsers[userIndex].password = newPassword;
            registeredUsers[userIndex].password_updated_at = new Date().toISOString();
            
            // Save updated users
            Auth.saveRegisteredUsers(registeredUsers);
            
            // Clear reset data
            localStorage.removeItem('resetOtp');
            localStorage.removeItem('resetMobile');
            localStorage.removeItem('otpExpiry');
            
            Utils.showNotification('Password reset successfully! You can now login with your new password.', 'success');
            return true;
        } catch (error) {
            throw new Error(error.message || 'Failed to reset password. Please try again.');
        }
    },

    // Check if mobile number is already registered
    isMobileRegistered: (mobile) => {
        const registeredUsers = Auth.getRegisteredUsers();
        return registeredUsers.some(u => u.mobile_number === mobile);
    },

    // Check if email is already registered
    isEmailRegistered: (email) => {
        const registeredUsers = Auth.getRegisteredUsers();
        return registeredUsers.some(u => u.email === email);
    },

    // Update user profile
    updateProfile: async (updatedData) => {
        try {
            const registeredUsers = Auth.getRegisteredUsers();
            const currentUser = Auth.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            
            const userIndex = registeredUsers.findIndex(u => u.user_id === currentUser.user_id);
            
            if (userIndex === -1) {
                throw new Error('User not found in registered users');
            }
            
            // Update user data
            registeredUsers[userIndex] = {
                ...registeredUsers[userIndex],
                ...updatedData,
                updated_at: new Date().toISOString()
            };
            
            // Save updated users
            Auth.saveRegisteredUsers(registeredUsers);
            
            // Update current session
            localStorage.setItem('currentUser', JSON.stringify(registeredUsers[userIndex]));
            
            Utils.showNotification('Profile updated successfully!', 'success');
            return registeredUsers[userIndex];
        } catch (error) {
            throw new Error(error.message || 'Failed to update profile');
        }
    },

    // Get user statistics
    getUserStats: () => {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return null;
        
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const userOrders = orders.filter(order => order.user_id === currentUser.user_id);
        
        return {
            totalOrders: userOrders.length,
            totalSpent: userOrders.reduce((total, order) => total + parseFloat(order.total_cost), 0),
            memberSince: new Date(currentUser.registered_at).toLocaleDateString()
        };
    }
};