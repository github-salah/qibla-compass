# Compass/Heading Library Analysis for React Native
**Date:** December 1, 2025  
**Project:** Qibla Finder App  
**Goal:** Find best library for accurate, smooth compass heading with native sensor fusion

---

## Current Situation

### Problem:
- `react-native-compass-heading` (v2.0.2) provides heading but updates are not smooth
- Only updates when device rotates ~90 degrees
- Manual calculations with `expo-sensors` Magnetometer require complex axis transformations
- Different devices have different sensor calibrations and fusion algorithms

### Requirements:
1. ✅ Cross-platform (iOS + Android)
2. ✅ Uses native sensor fusion (no manual calculations)
3. ✅ Smooth, frequent updates (target: 20Hz / 50ms intervals)
4. ✅ Accurate compass heading (0°=North, 90°=East, etc.)
5. ✅ Compatible with Expo
6. ✅ Active maintenance

---

## Library Options Analysis

### 1. **Expo Sensors (expo-sensors)** ⭐ RECOMMENDED
**Status:** Already installed (v15.0.7)  
**NPM:** https://www.npmjs.com/package/expo-sensors  
**Expo Docs:** https://docs.expo.dev/versions/latest/sdk/sensors/

#### Pros:
- ✅ **Official Expo package** - Best Expo integration
- ✅ **Cross-platform** - iOS & Android support
- ✅ **Multiple sensors available**:
  - `Magnetometer` - Raw magnetic field
  - `Accelerometer` - Device orientation/tilt
  - `Gyroscope` - Rotation rates
  - **`DeviceMotion`** - ⭐ **THIS IS THE KEY** - Provides sensor fusion!
- ✅ **Configurable update intervals** (can set to 50ms)
- ✅ **Active maintenance** - Part of Expo SDK
- ✅ **Already in your dependencies**

#### DeviceMotion - The Solution:
```typescript
import { DeviceMotion } from 'expo-sensors';

// DeviceMotion provides fused sensor data including:
// - rotation (alpha, beta, gamma) - Device orientation in 3D space
// - acceleration - Combined accelerometer + gravity
// - rotationRate - From gyroscope
// - orientation - Device screen orientation

DeviceMotion.setUpdateInterval(50); // 20Hz updates

const subscription = DeviceMotion.addListener(data => {
  // data.rotation.alpha = compass heading (0-360°)
  // Alpha represents rotation around Z-axis (perpendicular to screen)
  // 0° = North, 90° = East, 180° = South, 270° = West
  const heading = data.rotation.alpha;
});
```

**Why DeviceMotion is better:**
- Uses **native sensor fusion algorithms** (iOS CoreMotion, Android SensorManager)
- Combines magnetometer + accelerometer + gyroscope data
- OS handles calibration, axis transformations, and filtering
- Smooth updates - not dependent on threshold changes
- Accounts for device tilt automatically

#### Cons:
- Need to understand rotation matrix (alpha/beta/gamma)
- Requires device to be reasonably flat for accurate compass

#### Implementation Complexity: ⭐⭐ (Medium - cleaner than raw Magnetometer)

---

### 2. **react-native-compass-heading**
**Status:** Currently using (v2.0.2)  
**NPM:** https://www.npmjs.com/package/react-native-compass-heading

#### Pros:
- ✅ Simple API
- ✅ Cross-platform
- ✅ Uses native heading APIs

#### Cons:
- ❌ **Not smooth** - Updates only on significant heading changes (~90°)
- ❌ **No control over update frequency** - Uses native thresholds
- ❌ **Limited maintenance** - Last update 2 years ago
- ❌ **No Expo compatibility guarantee** - Requires native modules
- ❌ Platform-dependent behavior differences

#### Implementation Complexity: ⭐ (Simple but limited)

---

### 3. **react-native-sensors** (Community)
**NPM:** https://www.npmjs.com/package/react-native-sensors  
**Status:** Not installed

#### Pros:
- ✅ RxJS-based reactive streams
- ✅ Multiple sensor support
- ✅ Cross-platform

#### Cons:
- ❌ **Not Expo-compatible** - Requires native linking
- ❌ Still requires manual heading calculations
- ❌ Less maintained than Expo alternatives
- ❌ Would need to eject from Expo or use custom dev client

#### Implementation Complexity: ⭐⭐⭐⭐ (Complex, not compatible)

---

### 4. **@react-native-community/geolocation** (Location Heading)
**NPM:** https://www.npmjs.com/package/@react-native-community/geolocation

#### Pros:
- ✅ Provides heading from GPS movement

#### Cons:
- ❌ **GPS-based heading only** - Requires device to be moving
- ❌ Not suitable for stationary compass
- ❌ Inaccurate when standing still
- ❌ High battery usage

#### Implementation Complexity: ⭐⭐ (Simple but wrong use case)

---

### 5. **expo-location** (Location Heading)
**Status:** Already installed (v19.0.7)

#### Pros:
- ✅ Already in dependencies
- ✅ Expo official

#### Cons:
- ❌ Same as above - GPS-based heading (course)
- ❌ Requires movement to calculate heading
- ❌ Not suitable for stationary compass

---

## Recommendation: Use Expo DeviceMotion ⭐

### Why DeviceMotion is the Best Choice:

1. **Native Sensor Fusion:**
   - iOS: Uses CoreMotion framework (Apple's sensor fusion)
   - Android: Uses SensorManager with TYPE_ROTATION_VECTOR
   - Both platforms have sophisticated algorithms combining:
     - Magnetometer (compass)
     - Accelerometer (gravity/tilt)
     - Gyroscope (rotation rates)

2. **Smooth Updates:**
   - Configurable update interval (50ms = 20Hz)
   - Not threshold-based - continuous stream
   - Filtered by OS for stability

3. **No Manual Calculations:**
   - OS provides rotation matrix (Euler angles)
   - `alpha` = compass heading (0-360°)
   - `beta` = pitch (forward/backward tilt)
   - `gamma` = roll (left/right tilt)

4. **Already Available:**
   - Part of expo-sensors package you already have
   - No additional dependencies
   - Guaranteed Expo compatibility

### Implementation Plan:

```typescript
// services/HeadingService.ts
import { DeviceMotion } from 'expo-sensors';

class HeadingServiceClass {
  async start(): Promise<void> {
    // Set update interval to 50ms for smooth 20Hz updates
    DeviceMotion.setUpdateInterval(50);
    
    this.subscription = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      
      // rotation.alpha gives compass heading (0-360°)
      // 0° = North, 90° = East, 180° = South, 270° = West
      let heading = rotation.alpha || 0;
      
      // Apply calibration offset if needed
      heading = (heading + this.offsetDegrees) % 360;
      if (heading < 0) heading += 360;
      
      this.currentHeading = heading;
      this.emit(heading);
    });
  }
}
```

### Expected Results:
- ✅ Smooth rotation (20 updates per second)
- ✅ Accurate heading using native sensor fusion
- ✅ Works on both iOS and Android
- ✅ Minimal code changes
- ✅ No manual axis transformations
- ✅ Better battery efficiency (OS-level optimizations)

---

## Alternative: Hybrid Approach (If Needed)

If DeviceMotion doesn't provide smooth enough updates, consider combining:

```typescript
// Use DeviceMotion for accurate heading
// Use Gyroscope for smooth interpolation between updates

import { DeviceMotion, Gyroscope } from 'expo-sensors';

// DeviceMotion (50ms) - Ground truth heading
// Gyroscope (16ms) - Smooth interpolation
```

This gives sub-16ms response time while maintaining accuracy.

---

## Comparison Table

| Feature | expo-sensors DeviceMotion | react-native-compass-heading | Manual Magnetometer |
|---------|---------------------------|------------------------------|---------------------|
| **Smoothness** | ⭐⭐⭐⭐⭐ Excellent (20Hz) | ⭐⭐ Poor (threshold-based) | ⭐⭐⭐ Good (20Hz) |
| **Accuracy** | ⭐⭐⭐⭐⭐ Native fusion | ⭐⭐⭐⭐ Native API | ⭐⭐⭐ Manual calculation |
| **Cross-platform** | ✅ iOS + Android | ✅ iOS + Android | ✅ iOS + Android |
| **Expo Compatible** | ✅ Official | ⚠️ Requires config | ✅ Official |
| **Maintenance** | ✅ Active (Expo SDK) | ⚠️ Stale (2 years) | ✅ Active (Expo SDK) |
| **Setup Complexity** | ⭐⭐ Medium | ⭐ Simple | ⭐⭐⭐⭐ Complex |
| **Battery Impact** | ⭐⭐⭐⭐ Efficient | ⭐⭐⭐⭐ Efficient | ⭐⭐⭐ Moderate |
| **Tilt Compensation** | ✅ Automatic | ✅ Native | ❌ Manual |
| **Code to Maintain** | 📝 Minimal | 📝 Minimal | 📝📝📝 Significant |

---

## Final Recommendation

**Switch to DeviceMotion from expo-sensors:**

### Pros:
- Solves smoothness issue (continuous 20Hz updates vs threshold-based)
- Uses native sensor fusion (iOS CoreMotion, Android SensorManager)
- Already in your dependencies
- Better maintained than react-native-compass-heading
- More reliable across different device manufacturers

### Implementation Steps:
1. Replace `CompassHeading.start()` with `DeviceMotion.addListener()`
2. Use `rotation.alpha` for compass heading
3. Test on device for smooth rotation
4. Keep calibration offset feature for fine-tuning

### Migration Effort: 
~30 minutes (simple API swap in HeadingService.ts)

---

## Testing Checklist

After implementing DeviceMotion:
- [ ] Verify smooth rotation (no jumps)
- [ ] Test heading accuracy with known directions
- [ ] Verify 0° points to North
- [ ] Test on both Android and iOS if possible
- [ ] Check battery usage (should be efficient)
- [ ] Verify device tilt warning still works
- [ ] Test calibration offset feature still functions

---

**Conclusion:** DeviceMotion provides the best balance of accuracy, smoothness, and ease of implementation while eliminating manual sensor math.
