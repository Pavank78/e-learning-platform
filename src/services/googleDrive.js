// src/services/googleDrive.js
// Google Drive Config
const CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive';

// Store auth state in localStorage to persist across redirects
const AUTH_STORAGE_KEY = 'gdrive_auth_state';
const COURSE_CACHE_KEY = 'gdrive_course_cache';

const googleDriveService = {
  tokenClient: null,
  accessToken: null,
  isInitializing: false,
  isAuthenticating: false,

  // Check if we have a stored token
  initFromStorage: function() {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.accessToken && authData.expiry && new Date(authData.expiry) > new Date()) {
          console.log("Retrieved valid token from storage");
          this.accessToken = authData.accessToken;
          return true;
        } else {
          console.log("Stored token expired, clearing");
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Error parsing stored auth data", e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return false;
  },

 // Save token to storage
saveToStorage: function(token, expiresIn = 3600) {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + expiresIn);
    
    const authData = {
      accessToken: token,
      expiry: expiry.toISOString()
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  },
  
  // Clear all authentication data
  clearAuth: function() {
    this.accessToken = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(COURSE_CACHE_KEY);
    
    try {
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance) {
          authInstance.signOut();
        }
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  },
  
  initGoogleDriveApi: function() {
    return new Promise((resolve, reject) => {
      // Check if we already have a token in storage
      if (this.initFromStorage()) {
        return resolve();
      }
  
      // Prevent multiple simultaneous initializations
      if (this.isInitializing) {
        console.log("Already initializing Google API client, waiting...");
        const checkInterval = setInterval(() => {
          if (!this.isInitializing) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 500);
        return;
      }
  
      this.isInitializing = true;
      console.log("Initializing Google API client");
      
      if (!window.gapi) {
        console.error("Google API not loaded. Make sure the scripts are included in your HTML.");
        this.isInitializing = false;
        return reject(new Error("Google API not available. Please refresh the page."));
      }
      
      // Initialize the gapi.client with API key and discoveryDocs
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          console.log("Google API client initialized successfully");
          
          // Check for token in URL (after redirect back from Google)
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          const expiresIn = params.get('expires_in');
          
          if (accessToken) {
            console.log("Found access token in URL");
            this.accessToken = accessToken;
            
            // Save to storage
            if (expiresIn) {
              this.saveToStorage(accessToken, parseInt(expiresIn));
            } else {
              this.saveToStorage(accessToken);
            }
            
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Clear any cached course data when we get a new token
            localStorage.removeItem(COURSE_CACHE_KEY);
          }
          
          this.isInitializing = false;
          resolve();
        } catch (error) {
          console.error("Error initializing Google API client:", error);
          this.isInitializing = false;
          reject(new Error("Failed to initialize Google API: " + (error.message || "Unknown error")));
        }
      });
    });
  },
  
  authenticateGoogleDrive: function() {
    return new Promise((resolve, reject) => {
      try {
        // If we already have a token, just resolve
        if (this.accessToken) {
          console.log("Already have an access token");
          return resolve(this.accessToken);
        }
  
        // Prevent multiple simultaneous authentication attempts
        if (this.isAuthenticating) {
          console.log("Already authenticating with Google Drive, waiting...");
          return resolve();
        }
  
        console.log("Authenticating with Google Drive");
        this.isAuthenticating = true;
        
        // Create the OAuth2 URL for redirect
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('include_granted_scopes', 'true');
        // Add state parameter with timestamp to prevent caching
        authUrl.searchParams.append('state', Date.now().toString());
        
        console.log("Redirecting to auth URL:", authUrl.toString());
        
        // Redirect to Google's auth page
        window.location.href = authUrl.toString();
        
        // This promise won't resolve here because we're redirecting away
        // It will resolve after returning from the redirect with a token
      } catch (error) {
        console.error("Exception in authenticateGoogleDrive:", error);
        this.isAuthenticating = false;
        reject(new Error("Authentication error: " + (error.message || "Unknown error")));
      }
    });
  },
  
  // Updated to work with folder structure and prevent caching
  listCourses: function(rootFolderId, timestamp = Date.now()) {
    return new Promise((resolve, reject) => {
      try {
        if (!window.gapi || !window.gapi.client) {
          return reject(new Error("Google API client not initialized"));
        }
  
        // Make sure we have an access token
        if (!this.accessToken) {
          console.error("No access token available for listing courses");
          return reject(new Error("Not authenticated with Google Drive"));
        }
  
        // Set the access token for the request
        window.gapi.client.setToken({ access_token: this.accessToken });
        console.log("Access token set for course listing");
  
        // First, list all folders (courses) in the root folder
        // Add timestamp to prevent caching
        window.gapi.client.drive.files.list({
          q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)',
          orderBy: 'name',
          timestamp: timestamp // Add timestamp to prevent caching
        }).then(foldersResponse => {
          const courseFolders = foldersResponse.result.files;
          console.log("Course folders found:", courseFolders.length);
          
          // If no course folders found, return empty array
          if (!courseFolders || courseFolders.length === 0) {
            return resolve([]);
          }
          
          // Create an array of promises to get files for each course folder
          const coursePromises = courseFolders.map(folder => {
            // Add timestamp to prevent caching for each request
            return window.gapi.client.drive.files.list({
                q: `'${folder.id}' in parents and (mimeType='application/pdf' or mimeType contains 'video/') and trashed=false`,
                fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)',
                orderBy: 'name',
                timestamp: timestamp // Add timestamp to prevent caching
              }).then(filesResponse => {
                return {
                  id: folder.id,
                  title: folder.name,
                  materials: filesResponse.result.files.map(file => ({
                    id: file.id,
                    name: file.name,
                    type: file.mimeType.includes('video') ? 'video' : 'pdf',
                    url: file.webViewLink
                  }))
                };
              });
            });
            
            // Wait for all course data to be fetched
            Promise.all(coursePromises)
              .then(courses => {
                // Filter out courses with no materials
                const coursesWithMaterials = courses.filter(course => course.materials.length > 0);
                
                // Save to cache with timestamp
                try {
                  localStorage.setItem(COURSE_CACHE_KEY, JSON.stringify({
                    courses: coursesWithMaterials,
                    timestamp: Date.now()
                  }));
                } catch (e) {
                  console.warn("Could not cache course data:", e);
                }
                
                resolve(coursesWithMaterials);
              })
              .catch(error => {
                console.error("Error fetching course files:", error);
                reject(new Error("Error fetching course materials: " + (error.message || "Unknown error")));
              });
          }).catch(error => {
            console.error("Error listing course folders:", error);
            reject(new Error("Error listing course folders: " + (error.message || "Unknown error")));
          });
        } catch (error) {
          console.error("Exception in listCourses:", error);
          reject(new Error("Error listing courses: " + (error.message || "Unknown error")));
        }
      });
    },
  
    // Get materials for a specific course
    getCourseMaterials: function(courseFolderId, timestamp = Date.now()) {
      return new Promise((resolve, reject) => {
        try {
          if (!window.gapi || !window.gapi.client) {
            return reject(new Error("Google API client not initialized"));
          }
  
          // Set the access token for the request
          if (this.accessToken) {
            window.gapi.client.setToken({ access_token: this.accessToken });
          }
  
          // Get course info first - add timestamp for cache busting
          window.gapi.client.drive.files.get({
            fileId: courseFolderId,
            fields: 'id, name',
            timestamp: timestamp // Add timestamp to prevent caching
          }).then(folderResponse => {
            const courseInfo = folderResponse.result;
            
            // Get all materials in the course folder - add timestamp for cache busting
            window.gapi.client.drive.files.list({
              q: `'${courseFolderId}' in parents and (mimeType='application/pdf' or mimeType contains 'video/') and trashed=false`,
              fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)',
              orderBy: 'name',
              timestamp: timestamp // Add timestamp to prevent caching
            }).then(filesResponse => {
              const materials = filesResponse.result.files.map(file => ({
                id: file.id,
                name: file.name,
                type: file.mimeType.includes('video') ? 'video' : 'pdf',
                url: file.webViewLink
              }));
              
              const courseData = {
                id: courseInfo.id,
                title: courseInfo.name,
                materials: materials
              };
              
              resolve(courseData);
            }).catch(error => {
              console.error("Error listing course materials:", error);
              reject(new Error("Error listing course materials: " + (error.message || "Unknown error")));
            });
          }).catch(error => {
            console.error("Error getting course info:", error);
            reject(new Error("Error getting course info: " + (error.message || "Unknown error")));
          });
        } catch (error) {
          console.error("Exception in getCourseMaterials:", error);
          reject(new Error("Error getting course materials: " + (error.message || "Unknown error")));
        }
      });
    },
  
    // For backward compatibility - this function can still be used for flat structure
    listFiles: function(folderId = null, timestamp = Date.now()) {
      return new Promise((resolve, reject) => {
        try {
          if (!window.gapi || !window.gapi.client) {
            return reject(new Error("Google API client not initialized"));
          }
  
          // Set the access token for the request
          if (this.accessToken) {
            window.gapi.client.setToken({ access_token: this.accessToken });
          }
  
          let query = "mimeType='application/pdf' or mimeType contains 'video/'";
          
          if (folderId) {
            query += ` and '${folderId}' in parents`;
          }
          
          // Always exclude trashed items
          query += " and trashed=false";
          
          console.log("Executing query:", query);
          
          window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)',
            orderBy: 'name',
            timestamp: timestamp // Add timestamp to prevent caching
          }).then(response => {
            const files = response.result.files;
            resolve(files);
          }).catch(error => {
            console.error("Error listing files:", error);
            reject(new Error("Error listing files: " + (error.message || "Unknown error")));
          });
        } catch (error) {
          console.error("Exception in listFiles:", error);
          reject(new Error("Error listing files: " + (error.message || "Unknown error")));
        }
      });
    },
  
    // Force refresh of all data
    forceRefresh: function() {
      // Clear cache
      localStorage.removeItem(COURSE_CACHE_KEY);
      
      // Force token refresh if possible
      try {
        if (window.gapi && window.gapi.auth2) {
          const authInstance = window.gapi.auth2.getAuthInstance();
          if (authInstance && authInstance.currentUser) {
            const currentUser = authInstance.currentUser.get();
            if (currentUser) {
              currentUser.reloadAuthResponse();
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
};

export default googleDriveService;