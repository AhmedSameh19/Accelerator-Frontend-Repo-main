import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

// Get redirect URI from environment or use default
const REDIRECT_URI = 'https://accelerator.aiesec.org.eg/auth/callback'; // Must match the one registered in the auth provider

const CLIENT_ID = process.env.REACT_APP_AUTH_CLIENT_ID || 
                  process.env.REACT_APP_CLIENT_ID || 
                  '0Bwg6JeTDUb6h0O9SHNkOwepr3W34gcwVjj_VsLr9vs';

const CLIENT_SECRET = process.env.REACT_APP_AUTH_CLIENT_SECRET || 
                      process.env.REACT_APP_AUTH_CLIENT_SECRET || 
                      'Phri0eCQcwTjnnkji4wFLUJhSQ6qbJwTsqWc6tFCL7M';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenExchangeRef = useRef(false);

  useEffect(() => {
    console.log('🔍 [AuthCallbackPage] useEffect triggered');
    console.log('🔍 [AuthCallbackPage] Current URL:', window.location.href);
    console.log('🔍 [AuthCallbackPage] Location search:', location.search);
    
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('🔍 [AuthCallbackPage] URL params - code:', code, 'error:', error, 'error_description:', errorDescription);
    
    if (error) {
      console.error('❌ [AuthCallbackPage] Auth error received:', error, errorDescription);
      setError(`Authentication error: ${error} - ${errorDescription || ''}`);
      setLoading(false);
      return;
    }
    
    if (code && !tokenExchangeRef.current) {
      console.log('🔍 [AuthCallbackPage] Auth code found, starting token exchange...');
      tokenExchangeRef.current = true;
      exchangeCodeForToken(code);
    } else if (tokenExchangeRef.current) {
      console.log('🔍 [AuthCallbackPage] Token exchange already started, skipping...');
    } else {
      console.error('❌ [AuthCallbackPage] No authorization code found');
      setError('No authorization code found.');
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [location.search]);

  const exchangeCodeForToken = async (authCode) => {
    console.log('🔍 [AuthCallbackPage] exchangeCodeForToken() called with code:', authCode);
    setLoading(true);
    try {
      const tokenRequestBody = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code: authCode
      };
      
      console.log('🔍 [AuthCallbackPage] Token request body:', JSON.stringify(tokenRequestBody, null, 2));
      console.log('🔍 [AuthCallbackPage] Making token request to https://auth.aiesec.org/oauth/token...');

      const response = await fetch("https://auth.aiesec.org/oauth/token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(tokenRequestBody)
      });

      console.log('🔍 [AuthCallbackPage] Token response status:', response.status);
      console.log('🔍 [AuthCallbackPage] Token response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('🔍 [AuthCallbackPage] Token response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🔍 [AuthCallbackPage] Parsed token response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('❌ [AuthCallbackPage] Failed to parse JSON response:', e);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.error('❌ [AuthCallbackPage] Token request failed:', data);
        throw new Error(data.error_description || data.error || "Failed to get access token");
      }

      if (data.access_token) {
        console.log('🔍 [AuthCallbackPage] Access token received, setting cookies...');
        Cookies.set('access_token', data.access_token, {
          sameSite: 'lax',
          expires: data.expires_in ? data.expires_in / 86400 : 7
        });
        if (data.refresh_token) {
          console.log('🔍 [AuthCallbackPage] Refresh token received, setting cookie...');
          Cookies.set('refresh_token', data.refresh_token, {
            sameSite: 'lax'
          });
        }
        if (data.expires_in) {
          const expiryTime = new Date().getTime() + (data.expires_in * 1000);
          console.log('🔍 [AuthCallbackPage] Setting token expiry:', new Date(expiryTime));
          Cookies.set('token_expiry', expiryTime.toString(), {
            sameSite: 'lax'
          });
        }
        
        // Send tokens to backend for sync service
        try {
          const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || 'https://api-accelerator.aiesec.org.eg/api/v1';
          console.log('🔍 [AuthCallbackPage] Sending tokens to backend for sync service...');
          const backendResponse = await fetch(`${apiBaseUrl}/auth/expa-tokens`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              access_token: data.access_token,
              refresh_token: data.refresh_token || null,
              expires_in: data.expires_in || 3600
            })
          });
          
          if (backendResponse.ok) {
            console.log('✅ [AuthCallbackPage] Tokens stored in backend successfully');
          } else {
            console.warn('⚠️ [AuthCallbackPage] Failed to store tokens in backend, but continuing...');
          }
        } catch (backendError) {
          console.warn('⚠️ [AuthCallbackPage] Error sending tokens to backend:', backendError);
          // Don't fail the login if backend storage fails
        }
        
        console.log('🔍 [AuthCallbackPage] Fetching user data from EXPA...');
        console.log('🔍 [AuthCallbackPage] Using access token:', data.access_token);
        console.log('🔍 [AuthCallbackPage] Token scope:', data.scope);
        
        // Try GraphQL API first (same as the leads API)
        const graphqlQuery = `query {
          current_person {
            id
            full_name
            email
            home_lc {
              id
              name
            }
            home_mc {
              id
              name
            }
            current_positions {
              role
              title
              lc {
                id
                name
              }
              mc {
                id
                name
              }
            }
            roles
          }
        }`;
        
        console.log('🔍 [AuthCallbackPage] Trying GraphQL API...');
        const graphqlResponse = await fetch(`https://gis-api.aiesec.org/graphql?access_token=${data.access_token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ query: graphqlQuery })
        });
        
        console.log('🔍 [AuthCallbackPage] GraphQL response status:', graphqlResponse.status);
        
        if (graphqlResponse.ok) {
          const graphqlData = await graphqlResponse.json();
          console.log('🔍 [AuthCallbackPage] GraphQL response:', JSON.stringify(graphqlData, null, 2));
          
          if (graphqlData.data && graphqlData.data.current_person) {
            const userData = graphqlData.data.current_person;
            console.log('🔍 [AuthCallbackPage] User data received from GraphQL:', JSON.stringify(userData, null, 2));
            
            if (userData && userData.id) {
              Cookies.set('person_id', userData.id.toString(), {
                sameSite: 'lax'
              });
              if (userData && userData.full_name) {
                Cookies.set('name', userData.full_name.toString(), {
                  sameSite: 'lax'
                });
              // Extract role and LC/MC code
              let userRole = null;
              let userLC = null;
              // Try to get from current_positions or roles
              if (userData.current_positions && userData.current_positions.length > 0) {
                // Take the most recent or highest role
                const mainPosition = userData.current_positions[0];
                userRole = mainPosition.role || mainPosition.title || null;
                userLC = mainPosition.lc && mainPosition.lc.name ? mainPosition.lc.name : 
                        (mainPosition.lc && mainPosition.lc.id ? mainPosition.lc.id : null);
                // If MC, use home_mc
                if (!userLC && mainPosition.mc && mainPosition.mc.name) {
                  userLC = mainPosition.mc.name;
                } else if (!userLC && mainPosition.mc && mainPosition.mc.id) {
                  userLC = mainPosition.mc.id;
                }
              } else if (userData.roles && userData.roles.length > 0) {
                userRole = userData.roles[0];
              }
              // Fallback to home_lc/home_mc
              if (!userLC && userData.home_lc && userData.home_lc.name) {
                userLC = userData.home_lc.name;
              } else if (!userLC && userData.home_lc && userData.home_lc.id) {
                userLC = userData.home_lc.id;
              }
              if (!userLC && userData.home_mc && userData.home_mc.name) {
                userLC = userData.home_mc.name;
              } else if (!userLC && userData.home_mc && userData.home_mc.id) {
                userLC = userData.home_mc.id;
              }

              // Store in localStorage
              if (userRole) localStorage.setItem('userRole', userRole);
              if (userLC) localStorage.setItem('userLC', userLC);

              // Get current_offices from GraphQL response
              let currentOffices = null;
              if (userData.current_offices && userData.current_offices.length > 0) {
                currentOffices = userData.current_offices;
              } else if (userData.home_lc) {
                // Create a current_offices array from home_lc for compatibility
                currentOffices = [{
                  id: userData.home_lc.id,
                  name: userData.home_lc.name || userData.home_lc.id
                }];
              }

              // Optionally, update auth context (if login supports extra params)
              const userName = userData.full_name || userData.name || 'User';
              await login(data.access_token, userRole, userLC, userName, currentOffices);
              navigate('/leads', { replace: true });
              return;
            }
          }
        }
        
        // Fallback to REST API
        console.log('🔍 [AuthCallbackPage] GraphQL failed, trying REST API...');
        const userResponse = await fetch(`https://gis-api.aiesec.org/v2/current_person?access_token=${data.access_token}`, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });
        
        console.log('🔍 [AuthCallbackPage] REST API response status:', userResponse.status);
        console.log('🔍 [AuthCallbackPage] REST API response headers:', Object.fromEntries(userResponse.headers.entries()));
        if (!userResponse.ok) {
          console.error('❌ [AuthCallbackPage] REST API request failed:', userResponse.status);
          const userErrorText = await userResponse.text();
          console.error('❌ [AuthCallbackPage] REST API error response:', userErrorText);
          throw new Error("Failed to fetch user data from both GraphQL and REST APIs");
        }
        
        const userData = await userResponse.json();
        console.log('🔍 [AuthCallbackPage] User data received:', JSON.stringify(userData, null, 2));
        
        // The REST API returns data in a different structure
        const person = userData.person;
        console.log('🔍 [AuthCallbackPage] Person data:', JSON.stringify(person, null, 2));
        
        if (person && person.id) {
          Cookies.set('person_id', person.id.toString(), {
            sameSite: 'lax'
          });
          if(person.current_positions?.[0]?.parent?.id) {
            console.log('🔍 [AuthCallbackPage] Setting parent_id cookie:', person.current_positions[0].parent.id);
            Cookies.set('parent_id', person.current_positions?.[0]?.parent?.id, {
              sameSite: 'lax'
            });
          }
          // Also store the user email
          if (person.email) {
            Cookies.set('user_email', person.email, {
              sameSite: 'lax'
            });
          }
          if (person.full_name) {
            Cookies.set('user_name', person.full_name, {
              sameSite: 'lax'
            });
          }

          // Extract role and LC/MC code from REST API structure
          let userRole = null;
          let userLC = null;
          
          // Try to get from current_positions
          if (userData.current_positions && userData.current_positions.length > 0) {
            // Take the most recent or highest role
            const mainPosition = userData.current_positions[0];
            userRole = mainPosition.role || null;
            console.log('🔍 [AuthCallbackPage] Found role from current_positions:', userRole);
            
            // // For REST API, check if it's an MC position
            // if (mainPosition.parent && mainPosition.parent.role) {
            //   userRole = mainPosition.parent.role; // Use parent role (MCVP, etc.)
            //   console.log('🔍 [AuthCallbackPage] Using parent role:', userRole);
            // }
          }
          
          // Get LC/MC from current_offices or home_lc
          let currentOffices = null;
          if (userData.current_offices && userData.current_offices.length > 0) {
            currentOffices = userData.current_offices;
            userLC = userData.current_offices[0].name || userData.current_offices[0].id;
            console.log('🔍 [AuthCallbackPage] Found LC/MC from current_offices:', userLC);
          } else if (person.home_lc && person.home_lc.name) {
            userLC = person.home_lc.name;
            // Create a current_offices array from home_lc for compatibility
            currentOffices = [{
              id: person.home_lc.id,
              name: person.home_lc.name
            }];
            console.log('🔍 [AuthCallbackPage] Found LC from home_lc:', userLC);
          } else if (person.home_lc && person.home_lc.id) {
            userLC = person.home_lc.id;
            // Create a current_offices array from home_lc for compatibility
            currentOffices = [{
              id: person.home_lc.id,
              name: person.home_lc.name || person.home_lc.id
            }];
            console.log('🔍 [AuthCallbackPage] Found LC ID from home_lc:', userLC);
          }

          // Store in localStorage
          if (userRole) localStorage.setItem('userRole', userRole);
          if (userLC) localStorage.setItem('userLC', userLC);

          console.log('🔍 [AuthCallbackPage] Final values - Role:', userRole, 'LC:', userLC, 'Person ID:', person.id);
          console.log('🔍 [AuthCallbackPage] Calling login() function...');
          
          // Pass the user's actual name to the login function
          const userName = person.full_name || person.name || 'User';
          await login(data.access_token, userRole, userLC, userName, currentOffices);
          console.log('🔍 [AuthCallbackPage] Login successful, navigating to /leads...');
          navigate('/leads', { replace: true });
        } else {
          console.error('❌ [AuthCallbackPage] Person data missing ID - person:', person);
          setError('Your credentials are incorrect or you do not have access.');
        }
      } else {
        console.error('❌ [AuthCallbackPage] No access token in response - data:', data);
        setError('Your credentials are incorrect or you do not have access.');
      }
    }} catch (err) {
      console.error('❌ [AuthCallbackPage] Error in exchangeCodeForToken:', err);
      console.error('❌ [AuthCallbackPage] Error stack:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {loading && <CircularProgress />}
      {error && (
        <Typography color="error" variant="h6">{error}</Typography>
      )}
      {!loading && !error && (
        <Typography variant="h6">Login successful! Redirecting...</Typography>
      )}
    </Box>
  );
};

export default AuthCallbackPage; 
