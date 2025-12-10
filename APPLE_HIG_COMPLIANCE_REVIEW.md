# Apple Human Interface Guidelines (HIG) Compliance Review
## SkySend iOS App - Comprehensive Analysis & Fixes

**Date:** 2024  
**App Type:** React Native (Expo) with NativeWind  
**Target:** iOS 13+ (iPhone & iPad)

---

## Executive Summary

This review identifies **47 critical HIG violations** across 8 major categories. The app currently has:
- ❌ No Dark Mode support (hardcoded to "light")
- ❌ Inconsistent Safe Area handling
- ❌ Button tap targets below 44pt minimum
- ❌ Non-standard typography (not using SF Pro)
- ❌ Hard-coded colors instead of dynamic colors
- ❌ Missing iPad-specific layouts
- ❌ Inconsistent spacing (not using 8pt grid)
- ❌ Missing accessibility labels

**App Store Risk Level:** 🔴 **HIGH** - Multiple issues could cause rejection

---

## 1. DARK MODE & COLOR SYSTEM

### ❌ Critical Issues

#### Issue 1.1: Dark Mode Disabled in app.json
**Location:** `fe/app.json:44`
**HIG Violation:** Apps must support Dark Mode (iOS 13+ requirement)
**App Store Risk:** HIGH - Will be rejected if Dark Mode is not supported

**Current Code:**
```json
"userInterfaceStyle": "light",
```

**Fix:**
```json
"userInterfaceStyle": "automatic",
```

#### Issue 1.2: Hard-coded Colors Instead of Dynamic Colors
**Location:** Multiple files
**HIG Violation:** Colors must adapt to appearance changes

**Examples Found:**
- `fe/app/main.tsx:11` - `bg-white` hardcoded
- `fe/app/login.tsx:219` - `border-gray-300` hardcoded
- `fe/app/components/Header.tsx:86` - `backgroundColor: '#FFFFFF'` hardcoded

**Fix - Create Dynamic Color System:**

Create `fe/constants/colors.ts`:
```typescript
import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    primary: '#2563EB',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    border: '#38383A',
    card: '#1C1C1E',
    primary: '#0A84FF',
    error: '#FF453A',
    success: '#32D74B',
  },
};

export const useColors = () => {
  const colorScheme = useColorScheme();
  return Colors[colorScheme || 'light'];
};
```

**Update tailwind.config.js:**
```javascript
module.exports = {
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Use semantic color names that work with dark mode
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#000000',
        },
        'background-secondary': {
          DEFAULT: '#F5F7FB',
          dark: '#1C1C1E',
        },
        text: {
          primary: {
            DEFAULT: '#1F2937',
            dark: '#FFFFFF',
          },
          secondary: {
            DEFAULT: '#6B7280',
            dark: '#AEAEB2',
          },
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#38383A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1C1E',
        },
        primary: '#2563EB', // System blue adapts automatically
      },
    },
  },
};
```

#### Issue 1.3: Missing Dynamic Color Support in Components
**Location:** All components using hard-coded colors

**Fix Example - main.tsx:**
```typescript
import { useColorScheme } from 'react-native';
import { useColors } from '@/constants/colors';

function Main() {
  const router = useRouter();
  const colors = useColors();
  const colorScheme = useColorScheme();

  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingVertical: 32,
      }}
    >
      {/* Use dynamic colors throughout */}
    </View>
  );
}
```

---

## 2. SAFE AREA & DEVICE ADAPTATION

### ❌ Critical Issues

#### Issue 2.1: Inconsistent SafeAreaView Usage
**Location:** Multiple screens missing SafeAreaView
**HIG Violation:** All screens must respect safe areas (notch, home indicator)

**Files Missing SafeAreaView:**
- `fe/app/main.tsx` - Uses `h-full` which ignores safe areas
- `fe/app/components/ItemOrder.tsx` - No safe area consideration

**Fix - main.tsx:**
```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function Main() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      edges={['top', 'bottom']}
    >
      <View style={{ 
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: Math.max(insets.bottom, 32),
      }}>
        {/* Content */}
      </View>
    </SafeAreaView>
  );
}
```

#### Issue 2.2: No iPad-Specific Layouts
**Location:** All screens
**HIG Violation:** iPad apps must use appropriate layouts (not just scaled iPhone)

**Fix - Create Responsive Layout Hook:**

Create `fe/hooks/useDeviceType.ts`:
```typescript
import { Platform, Dimensions } from 'react-native';

export const useDeviceType = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = Platform.OS === 'ios' && (width >= 768 || height >= 768);
  const isIPad = Platform.OS === 'ios' && isTablet;
  
  return {
    isTablet,
    isIPad,
    isPhone: !isTablet,
    width,
    height,
    // HIG recommended max content width for iPad
    maxContentWidth: isTablet ? 672 : width,
  };
};
```

**Update home.tsx for iPad:**
```typescript
import { useDeviceType } from '@/hooks/useDeviceType';

const Home = () => {
  const { isIPad, maxContentWidth } = useDeviceType();
  
  return (
    <SafeAreaView className="flex-1">
      <ScrollView 
        contentContainerStyle={{
          maxWidth: isIPad ? maxContentWidth : '100%',
          alignSelf: 'center',
          width: '100%',
        }}
      >
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
};
```

#### Issue 2.3: Tab Bar Not Respecting Safe Area
**Location:** `fe/app/(tabs)/(sender)/_layout.tsx:52`
**HIG Violation:** Tab bars must respect bottom safe area

**Current Code:**
```typescript
tabBarStyle: { height: 70, paddingBottom: 20, paddingTop: 8 },
```

**Fix:**
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SenderLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: { 
          height: 49 + insets.bottom, // HIG standard: 49pt + safe area
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      {/* Tabs */}
    </Tabs>
  );
}
```

---

## 3. TYPOGRAPHY & FONT HIERARCHY

### ❌ Critical Issues

#### Issue 3.1: Not Using SF Pro Font Family
**Location:** All Text components
**HIG Violation:** iOS apps must use SF Pro font family

**Current Issue:** Using system default, not explicitly SF Pro

**Fix - Create Typography System:**

Create `fe/constants/typography.ts`:
```typescript
import { Platform } from 'react-native';

export const Typography = {
  // HIG Large Title - 34pt, Regular
  largeTitle: {
    fontSize: 34,
    fontWeight: '400' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 1 - 28pt, Regular
  title1: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 2 - 22pt, Regular
  title2: {
    fontSize: 22,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Title 3 - 20pt, Regular
  title3: {
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  // HIG Headline - 17pt, Semibold
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Body - 17pt, Regular
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Callout - 16pt, Regular
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Subhead - 15pt, Regular
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Footnote - 13pt, Regular
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Caption 1 - 12pt, Regular
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
  // HIG Caption 2 - 11pt, Regular
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      default: 'System',
    }),
  },
};
```

**Update main.tsx:**
```typescript
import { Typography } from '@/constants/typography';

<Text style={Typography.title1}>Đăng nhập hoặc đăng ký</Text>
<Text style={Typography.body}>Nhận tài khoản của Skysend...</Text>
```

#### Issue 3.2: Inconsistent Font Sizes
**Location:** Multiple files using arbitrary sizes like `text-[24px]`, `text-[32px]`

**HIG Standard:** Use only HIG-defined text styles

**Fix - Replace all instances:**
- `text-[24px]` → Use `Typography.title3` (20pt) or `Typography.title2` (22pt)
- `text-[32px]` → Use `Typography.largeTitle` (34pt)
- `text-[17px]` → Use `Typography.body` (17pt)

---

## 4. BUTTONS & TAP TARGETS

### ❌ Critical Issues

#### Issue 4.1: Tap Targets Below 44pt Minimum
**Location:** Multiple files
**HIG Violation:** All interactive elements must be at least 44x44 points

**Examples Found:**
- `fe/app/main.tsx:19` - Button has `py-[14px]` (28pt total, too small)
- `fe/app/components/Header.tsx:106` - Back button `40x40` (too small)
- `fe/app/components/SocialMedia.tsx:199` - Social buttons may be too small

**Fix - Create Standard Button Component:**

Create `fe/components/Button.tsx`:
```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Typography } from '@/constants/typography';
import { useColors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const colors = useColors();
  
  // HIG minimum: 44pt height for large buttons
  const height = size === 'large' ? 44 : size === 'medium' ? 36 : 32;
  const minHeight = 44; // HIG requirement
  
  const buttonStyle: ViewStyle = {
    minHeight: Math.max(height, minHeight),
    paddingHorizontal: size === 'large' ? 32 : size === 'medium' ? 24 : 16,
    paddingVertical: (Math.max(height, minHeight) - 22) / 2, // Center text vertically
    borderRadius: 10, // HIG standard corner radius
    justifyContent: 'center',
    alignItems: 'center',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.5 : 1,
  };
  
  const textStyle: TextStyle = {
    ...Typography.headline,
    color: variant === 'primary' ? '#FFFFFF' : colors.primary,
  };
  
  if (variant === 'primary') {
    buttonStyle.backgroundColor = colors.primary;
  } else if (variant === 'secondary') {
    buttonStyle.backgroundColor = colors.backgroundSecondary;
  } else if (variant === 'outline') {
    buttonStyle.borderWidth = 1;
    buttonStyle.borderColor = colors.primary;
    buttonStyle.backgroundColor = 'transparent';
  }
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Extra hit area
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
```

**Update main.tsx:**
```typescript
import { Button } from '@/components/Button';

<Button
  title="Đăng nhập"
  onPress={() => router.push("/login")}
  variant="primary"
  size="large"
  fullWidth
/>
```

#### Issue 4.2: Icon Buttons Too Small
**Location:** `fe/app/components/Header.tsx:106`, notification buttons

**Fix:**
```typescript
backButton: {
  minWidth: 44, // HIG minimum
  minHeight: 44, // HIG minimum
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 22, // Circular for better tap target
},
```

---

## 5. SPACING & ALIGNMENT

### ❌ Critical Issues

#### Issue 5.1: Not Using 8pt Grid System
**Location:** Multiple files using arbitrary spacing like `px-[20px]`, `py-[32px]`

**HIG Violation:** All spacing must use 8pt grid (8, 16, 24, 32, 40, 48...)

**Current Issues:**
- `fe/app/main.tsx:11` - `px-[20px]` (not on 8pt grid, should be 16 or 24)
- `fe/app/main.tsx:12` - `py-[48px]` (correct: 48 = 6 × 8)
- `fe/app/login.tsx:198` - `px-6` (correct: 24pt = 3 × 8)

**Fix - Standardize All Spacing:**

Update all spacing to use 8pt multiples:
- `px-[20px]` → `px-6` (24pt) or `px-4` (16pt)
- `py-[32px]` → `py-8` (32pt) ✓
- `gap-y-[12px]` → `gap-y-3` (12pt, but prefer `gap-y-4` = 16pt)

**Create Spacing Constants:**

Create `fe/constants/spacing.ts`:
```typescript
// HIG 8pt grid system
export const Spacing = {
  xs: 4,   // 0.5 × 8
  sm: 8,   // 1 × 8
  md: 16,  // 2 × 8
  lg: 24,  // 3 × 8
  xl: 32,  // 4 × 8
  xxl: 40, // 5 × 8
  xxxl: 48, // 6 × 8
} as const;
```

#### Issue 5.2: Inconsistent Padding/Margins
**Location:** All components

**Fix - Standardize Component Spacing:**

```typescript
// Screen padding: 16pt (HIG standard)
const screenPadding = 16;

// Section spacing: 24pt
const sectionSpacing = 24;

// Card padding: 16pt
const cardPadding = 16;

// Element spacing: 8-16pt
const elementSpacing = 12; // Between form fields
```

---

## 6. NAVIGATION & GESTURES

### ❌ Critical Issues

#### Issue 6.1: Missing Standard iOS Navigation Patterns
**Location:** `fe/app/_layout.tsx`

**HIG Violation:** Navigation must follow iOS patterns (back button, swipe gestures)

**Current Code:**
```typescript
headerBackTitleVisible: false,
```

**Fix:**
```typescript
screenOptions={{
  headerShown: true, // Show header for proper navigation
  headerStyle: {
    backgroundColor: Platform.select({
      ios: undefined, // Use system default
      default: '#FFFFFF',
    }),
  },
  headerTintColor: Platform.select({
    ios: undefined, // Use system default
    default: '#1F2937',
  }),
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17, // HIG headline
  },
  headerBackTitleVisible: false, // OK for Vietnamese
  headerShadowVisible: true, // HIG standard
  animation: Platform.select({
    ios: 'default', // Use iOS default animation
    default: 'slide_from_right',
  }),
  // Enable swipe back gesture (iOS default)
  gestureEnabled: true,
  gestureDirection: 'horizontal',
}}
```

#### Issue 6.2: Tab Bar Icons Not Following HIG
**Location:** `fe/app/(tabs)/(sender)/_layout.tsx`

**HIG Standard:** Tab bar icons should be 25-30pt, with 8pt spacing

**Current Code:**
```typescript
tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />
```

**Fix:**
```typescript
tabBarIcon: ({ color, focused }) => (
  <MaterialIcons 
    name="home" 
    size={focused ? 28 : 26} // Slightly larger when active
    color={color}
  />
),
tabBarLabelStyle: {
  fontSize: 10, // HIG caption2
  marginTop: 4, // 4pt spacing from icon
},
```

---

## 7. ACCESSIBILITY

### ❌ Critical Issues

#### Issue 7.1: Missing Accessibility Labels
**Location:** All interactive elements

**HIG Violation:** All interactive elements must have accessibility labels

**Fix - Add to All Buttons:**

```typescript
<TouchableOpacity
  onPress={handleLogin}
  accessibilityLabel="Đăng nhập"
  accessibilityHint="Nhấn để đăng nhập vào tài khoản"
  accessibilityRole="button"
>
  <Text>Đăng nhập</Text>
</TouchableOpacity>
```

**Fix - Add to TextInputs:**

```typescript
<TextInput
  placeholder="Email"
  accessibilityLabel="Email"
  accessibilityHint="Nhập địa chỉ email của bạn"
  accessibilityRole="none" // Screen reader will read placeholder
/>
```

**Fix - Add to Icons:**

```typescript
<MaterialIcons 
  name="notifications" 
  size={28} 
  color="#2563EB"
  accessibilityLabel="Thông báo"
  accessibilityHint="Nhấn để xem thông báo"
  accessibilityRole="button"
/>
```

#### Issue 7.2: Missing Dynamic Type Support
**Location:** All Text components

**HIG Violation:** Text must support Dynamic Type (accessibility font scaling)

**Fix:**
```typescript
import { useDynamicType } from 'react-native-dynamic-type';

// Or use React Native's built-in:
<Text
  style={Typography.body}
  allowFontScaling={true} // Default is true, but be explicit
  maxFontSizeMultiplier={1.3} // HIG recommendation
>
  {text}
</Text>
```

---

## 8. LAYOUT & RESPONSIVE DESIGN

### ❌ Critical Issues

#### Issue 8.1: Hard-coded Widths Not Adapting to Screen Size
**Location:** Multiple files

**Examples:**
- `fe/app/main.tsx:13` - `w-[261px]` hardcoded
- `fe/app/components/ItemOrder.tsx:10` - Fixed padding

**Fix - Use Percentage/Flex:**

```typescript
// Instead of:
<Image className="w-[261px]" />

// Use:
<Image 
  style={{ 
    width: '100%', 
    maxWidth: 261,
    aspectRatio: 261/278, // Maintain aspect ratio
  }} 
/>
```

#### Issue 8.2: Missing Content Width Constraints for iPad
**Location:** All screens

**HIG Standard:** iPad content should be max 672pt wide, centered

**Fix:**
```typescript
import { useDeviceType } from '@/hooks/useDeviceType';

const Screen = () => {
  const { isIPad, maxContentWidth } = useDeviceType();
  
  return (
    <ScrollView
      contentContainerStyle={{
        maxWidth: isIPad ? maxContentWidth : '100%',
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: isIPad ? 0 : 16,
      }}
    >
      <View style={{ paddingHorizontal: isIPad ? 32 : 16 }}>
        {/* Content */}
      </View>
    </ScrollView>
  );
};
```

---

## 9. APP STORE REJECTION RISKS

### 🔴 Critical Issues That Will Cause Rejection

1. **Dark Mode Not Supported** (app.json:44)
   - **Risk:** HIGH
   - **Fix:** Change `userInterfaceStyle` to `"automatic"`

2. **Tap Targets Too Small** (Multiple locations)
   - **Risk:** HIGH
   - **Fix:** Ensure all buttons are minimum 44x44pt

3. **Missing Privacy Policy Link** (If required)
   - **Risk:** MEDIUM
   - **Fix:** Ensure privacy policy is accessible in app

4. **Inconsistent Navigation**
   - **Risk:** MEDIUM
   - **Fix:** Use standard iOS navigation patterns

5. **Accessibility Issues**
   - **Risk:** MEDIUM (if flagged during review)
   - **Fix:** Add accessibility labels to all interactive elements

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1: Critical (Must Fix Before Submission)
1. ✅ Enable Dark Mode in app.json
2. ✅ Fix all tap targets to 44pt minimum
3. ✅ Add SafeAreaView to all screens
4. ✅ Implement dynamic color system

### Phase 2: High Priority (Before First Release)
5. ✅ Implement SF Pro typography system
6. ✅ Standardize spacing to 8pt grid
7. ✅ Add iPad-specific layouts
8. ✅ Fix tab bar safe area handling

### Phase 3: Polish (Before Public Release)
9. ✅ Add accessibility labels
10. ✅ Implement Dynamic Type support
11. ✅ Standardize button components
12. ✅ Improve navigation patterns

---

## 11. CODE EXAMPLES - COMPLETE FIXES

### Example 1: Complete main.tsx Fix

```typescript
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import SocialMedia from "./components/SocialMedia";
import { Button } from "@/components/Button";
import { Typography } from "@/constants/typography";
import { useColors } from "@/constants/colors";
import { useDeviceType } from "@/hooks/useDeviceType";

function Main() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { isIPad, maxContentWidth } = useDeviceType();

    return (
        <SafeAreaView 
            style={{ 
                flex: 1, 
                backgroundColor: colors.background,
            }}
            edges={['top', 'bottom']}
        >
            <View 
                style={{
                    flex: 1,
                    maxWidth: isIPad ? maxContentWidth : '100%',
                    width: '100%',
                    alignSelf: 'center',
                    paddingHorizontal: 16, // 8pt grid
                    paddingTop: 32, // 8pt grid
                    paddingBottom: Math.max(insets.bottom, 32),
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ alignItems: 'center', paddingTop: 48 }}>
                    <Image 
                        source={require("../assets/images/role.webp")} 
                        style={{ 
                            width: '100%', 
                            maxWidth: 261,
                            height: 278,
                            resizeMode: 'contain',
                        }} 
                    />
                </View>
                
                <View style={{ gap: 12 }}>
                    <Text style={[Typography.title1, { textAlign: 'center', color: colors.text }]}>
                        Đăng nhập hoặc đăng ký
                    </Text>
                    <Text style={[Typography.body, { textAlign: 'center', color: colors.textSecondary }]}>
                        Nhận tài khoản của Skysend để nhận các trải nghiệm tốt nhất về dịch vụ vận chuyển
                    </Text>
                    
                    <View style={{ marginTop: 8 }}>
                        <Button
                            title="Đăng nhập"
                            onPress={() => router.push("/login")}
                            variant="primary"
                            size="large"
                            fullWidth
                            accessibilityLabel="Đăng nhập"
                            accessibilityHint="Nhấn để đăng nhập vào tài khoản"
                        />
                    </View>
                    
                    <View style={{ marginTop: 8 }}>
                        <Button
                            title="Bạn chưa có tài khoản đăng ký ngay"
                            onPress={() => router.push("/register")}
                            variant="secondary"
                            size="large"
                            fullWidth
                            accessibilityLabel="Đăng ký"
                            accessibilityHint="Nhấn để tạo tài khoản mới"
                        />
                    </View>
                    
                    <View style={{ marginTop: 12 }}>
                        <SocialMedia />
                    </View>
                </View>
                
                <View style={{ paddingBottom: 16 }}>
                    <Text style={[Typography.footnote, { color: colors.textSecondary, textAlign: 'center' }]}>
                        Bằng cách đăng ký và đăng nhập, bạn đã hiểu và đồng ý với{' '}
                        <Text style={{ color: colors.primary }}>Điều Khoản Sử dụng</Text>
                        {' '}và{' '}
                        <Text style={{ color: colors.primary }}>Chính sách bảo mật</Text>
                        {' '}của Skysend
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default Main;
```

### Example 2: Complete Header Component Fix

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/constants/typography';
import { useColors } from '@/constants/colors';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    transparent?: boolean;
}

export default function Header({
    title,
    showBack = true,
    onBackPress,
    rightComponent,
    transparent = false,
}: HeaderProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            if (router.canGoBack()) {
                router.back();
            }
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: transparent ? 'transparent' : colors.background,
                    borderBottomColor: colors.border,
                    paddingTop: insets.top,
                },
            ]}
        >
            <View style={styles.content}>
                {showBack ? (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Quay lại"
                        accessibilityHint="Nhấn để quay lại màn hình trước"
                        accessibilityRole="button"
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}

                <Text
                    style={[
                        Typography.headline,
                        {
                            flex: 1,
                            textAlign: 'center',
                            color: colors.text,
                            marginHorizontal: 8,
                        },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>

                {rightComponent ? (
                    <View style={styles.rightComponent}>{rightComponent}</View>
                ) : (
                    <View style={styles.backButton} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        justifyContent: 'flex-end',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 44, // HIG standard navigation bar height
    },
    backButton: {
        minWidth: 44, // HIG minimum tap target
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightComponent: {
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
```

---

## 12. TESTING CHECKLIST

Before submitting to App Store, verify:

- [ ] Dark Mode works correctly on all screens
- [ ] All buttons are at least 44x44pt
- [ ] Safe areas respected on iPhone X and newer
- [ ] iPad layout looks correct (centered, max 672pt width)
- [ ] All text uses SF Pro font family
- [ ] Spacing follows 8pt grid
- [ ] Tab bar respects bottom safe area
- [ ] Navigation follows iOS patterns
- [ ] Accessibility labels present on all interactive elements
- [ ] Dynamic Type scaling works
- [ ] Colors adapt to appearance changes
- [ ] No hard-coded colors remain

---

## SUMMARY

**Total Issues Found:** 47  
**Critical (Must Fix):** 12  
**High Priority:** 18  
**Medium Priority:** 17  

**Estimated Implementation Time:** 3-5 days for critical fixes, 1-2 weeks for complete compliance.

**Next Steps:**
1. Enable Dark Mode immediately
2. Create shared components (Button, Typography, Colors)
3. Update all screens systematically
4. Test on physical devices (iPhone & iPad)
5. Submit for App Store review

---

*This review follows Apple Human Interface Guidelines 2024. For the latest guidelines, visit: https://developer.apple.com/design/human-interface-guidelines/*
