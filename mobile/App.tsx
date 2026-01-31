/**
 * DELTA EBooks Mobile App
 * 
 * React Native app with:
 * - WebView wrapping the existing web app
 * - Google AdMob rewarded ads integration
 * - Native premium unlock flow
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════

// Your web app URL (change to production URL when deploying)
const WEB_APP_URL = __DEV__ 
  ? 'http://10.0.2.2:5173'  // Android emulator localhost
  : 'https://your-delta-ebooks-domain.com';

// AdMob Ad Unit IDs
// IMPORTANT: Replace with your real ad unit IDs from AdMob console
const ADMOB_REWARDED_AD_ID = __DEV__
  ? TestIds.REWARDED  // Test ID for development
  : Platform.select({
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // Your Android rewarded ad unit ID
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',     // Your iOS rewarded ad unit ID
      default: TestIds.REWARDED,
    });

// ══════════════════════════════════════════════════════════════════
// REWARDED AD HOOK
// ══════════════════════════════════════════════════════════════════

const useRewardedAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rewardedAdRef = useRef<RewardedAd | null>(null);
  
  const loadAd = useCallback(() => {
    setLoading(true);
    setError(null);
    
    const rewarded = RewardedAd.createForAdRequest(ADMOB_REWARDED_AD_ID!, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['books', 'reading', 'education', 'self-improvement'],
    });
    
    rewardedAdRef.current = rewarded;
    
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
      console.log('Rewarded ad loaded');
    });
    
    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (err) => {
      setError(err.message);
      setLoading(false);
      console.error('Rewarded ad error:', err);
    });
    
    rewarded.load();
    
    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  }, []);
  
  const showAd = useCallback((): Promise<{ rewarded: boolean; amount: number }> => {
    return new Promise((resolve, reject) => {
      if (!rewardedAdRef.current || !loaded) {
        reject(new Error('Ad not loaded'));
        return;
      }
      
      const unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log('User earned reward:', reward);
          resolve({ rewarded: true, amount: reward.amount });
        }
      );
      
      const unsubscribeClosed = rewardedAdRef.current.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          setLoaded(false);
          // Reload ad for next time
          loadAd();
        }
      );
      
      rewardedAdRef.current.show().catch((err) => {
        reject(err);
      });
      
      // Cleanup will happen when ad closes
      return () => {
        unsubscribeEarned();
        unsubscribeClosed();
      };
    });
  }, [loaded, loadAd]);
  
  // Load ad on mount
  useEffect(() => {
    loadAd();
  }, [loadAd]);
  
  return { loaded, loading, error, showAd, loadAd };
};

// ══════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════

const App: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adStatus, setAdStatus] = useState<'loading' | 'ready' | 'watching' | 'success' | 'error'>('loading');
  
  const { loaded: adLoaded, loading: adLoading, error: adError, showAd, loadAd } = useRewardedAd();
  
  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [canGoBack]);
  
  // JavaScript to inject into WebView for communication
  const injectedJavaScript = `
    (function() {
      // Override the web app's ad watching function
      window.watchRewardedAd = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WATCH_AD'
        }));
      };
      
      // Check if running in mobile app
      window.isMobileApp = true;
      window.platform = '${Platform.OS}';
      
      // Function to receive messages from React Native
      window.receiveNativeMessage = function(message) {
        const event = new CustomEvent('nativeMessage', { detail: message });
        window.dispatchEvent(event);
      };
      
      true;
    })();
  `;
  
  // Handle messages from WebView
  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'WATCH_AD':
          handleWatchAd();
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };
  
  // Handle watch ad request
  const handleWatchAd = async () => {
    setShowAdModal(true);
    
    if (!adLoaded) {
      setAdStatus('loading');
      loadAd();
      
      // Wait for ad to load (with timeout)
      const timeout = setTimeout(() => {
        if (!adLoaded) {
          setAdStatus('error');
        }
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
    
    setAdStatus('ready');
  };
  
  // Show the ad
  const handleShowAd = async () => {
    setAdStatus('watching');
    
    try {
      const result = await showAd();
      
      if (result.rewarded) {
        setAdStatus('success');
        
        // Send success message to WebView
        const deviceId = await AsyncStorage.getItem('device_id') || generateDeviceId();
        
        webViewRef.current?.injectJavaScript(`
          (async function() {
            try {
              const response = await fetch('/api/premium/grant-access', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + localStorage.getItem('delta_token'),
                },
                body: JSON.stringify({
                  adNetwork: 'admob',
                  platform: '${Platform.OS}',
                  deviceId: '${deviceId}',
                  rewardAmount: ${result.amount},
                }),
              });
              
              if (response.ok) {
                // Refresh premium status in the web app
                window.dispatchEvent(new CustomEvent('premiumGranted'));
              }
            } catch (err) {
              console.error('Failed to grant premium:', err);
            }
          })();
          true;
        `);
        
        // Close modal after delay
        setTimeout(() => {
          setShowAdModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error showing ad:', err);
      setAdStatus('error');
    }
  };
  
  // Generate unique device ID
  const generateDeviceId = (): string => {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    AsyncStorage.setItem('device_id', id);
    return id;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#78716C" />
            <Text style={styles.loadingText}>Loading DELTA EBooks...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
      />
      
      {/* Ad Modal */}
      <Modal
        visible={showAdModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => adStatus !== 'watching' && setShowAdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {adStatus === 'loading' && (
              <>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.modalTitle}>Loading Ad...</Text>
                <Text style={styles.modalSubtitle}>Please wait</Text>
              </>
            )}
            
            {adStatus === 'ready' && (
              <>
                <Text style={styles.emoji}>🎬</Text>
                <Text style={styles.modalTitle}>Ready to Watch</Text>
                <Text style={styles.modalSubtitle}>
                  Watch a short video to unlock 7 days of premium access
                </Text>
                <TouchableOpacity style={styles.watchButton} onPress={handleShowAd}>
                  <Text style={styles.watchButtonText}>▶ Watch Now</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowAdModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
            
            {adStatus === 'watching' && (
              <>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.modalTitle}>Playing Ad...</Text>
                <Text style={styles.modalSubtitle}>Please watch until the end</Text>
              </>
            )}
            
            {adStatus === 'success' && (
              <>
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.modalTitle}>Premium Unlocked!</Text>
                <Text style={styles.modalSubtitle}>
                  Enjoy 7 days of full access
                </Text>
              </>
            )}
            
            {adStatus === 'error' && (
              <>
                <Text style={styles.emoji}>😕</Text>
                <Text style={styles.modalTitle}>Ad Not Available</Text>
                <Text style={styles.modalSubtitle}>
                  {adError || 'Please try again later'}
                </Text>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setShowAdModal(false);
                    loadAd();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#78716C',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  watchButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#78716C',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
