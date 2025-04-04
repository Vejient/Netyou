// Firebase configuration
// Import the functions you need from the SDKs

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDf33anGWr7VNa0Iv-os5MN56MOUZkXgUg",
  authDomain: "base-de-datos-fae1b.firebaseapp.com",
  projectId: "base-de-datos-fae1b",
  storageBucket: "base-de-datos-fae1b.firebasestorage.app",
  messagingSenderId: "1079418388986",
  appId: "1:1079418388986:web:580631417d1555eab62443",
  measurementId: "G-480NTLHQCX"
};

// Initialize Firebase
function initFirebase() {
  // Check if firebase is already loaded
  if (!window.firebase) {
    console.error('Firebase SDK not loaded. Make sure to include the Firebase SDK script.');
    return false;
  }
  
  // Initialize Firebase if not already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  return true;
}

// Function to get current user
function getCurrentUser() {
  return firebase.auth().currentUser;
}

// Function to check if user is logged in
function isUserLoggedIn() {
  return firebase.auth().currentUser !== null;
}

// Function to register a new user
async function registerUser(email, password, name) {
  try {
    // Create user with email and password
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    
    // Update user profile with name
    await userCredential.user.updateProfile({
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });
    
    // Return user object
    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Function to login user
async function loginUser(email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Function to logout user
async function logoutUser() {
  try {
    await firebase.auth().signOut();
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

// Function to update user profile
async function updateUserProfile(displayName, photoURL) {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      await user.updateProfile({
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Export functions
window.firebaseAuth = {
  initFirebase,
  getCurrentUser,
  isUserLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile
};