# Apple HIG Quick Reference Guide
## For SkySend iOS App Development

## 🎨 Colors

```typescript
import { useColors } from '@/constants/colors';

const colors = useColors();

// Use these instead of hard-coded colors:
colors.background          // Main background
colors.backgroundSecondary // Secondary background
colors.text                // Primary text
colors.textSecondary       // Secondary text
colors.border              // Borders
colors.card                // Card backgrounds
colors.primary             // Primary action color
colors.error               // Error states
colors.success             // Success states
```

## 📝 Typography

```typescript
import { Typography } from '@/constants/typography';

// Available styles (use these instead of arbitrary sizes):
<Text style={Typography.largeTitle}>Large Title (34pt)</Text>
<Text style={Typography.title1}>Title 1 (28pt)</Text>
<Text style={Typography.title2}>Title 2 (22pt)</Text>
<Text style={Typography.title3}>Title 3 (20pt)</Text>
<Text style={Typography.headline}>Headline (17pt, Semibold)</Text>
<Text style={Typography.body}>Body (17pt)</Text>
<Text style={Typography.callout}>Callout (16pt)</Text>
<Text style={Typography.subhead}>Subhead (15pt)</Text>
<Text style={Typography.footnote}>Footnote (13pt)</Text>
<Text style={Typography.caption1}>Caption 1 (12pt)</Text>
<Text style={Typography.caption2}>Caption 2 (11pt)</Text>
```

## 📏 Spacing (8pt Grid)

```typescript
import { Spacing, ComponentSpacing } from '@/constants/spacing';

// Use these constants:
Spacing.xs      // 4pt
Spacing.sm      // 8pt
Spacing.md      // 16pt
Spacing.lg      // 24pt
Spacing.xl      // 32pt
Spacing.xxl     // 40pt
Spacing.xxxl    // 48pt

ComponentSpacing.screenPadding   // 16pt
ComponentSpacing.sectionSpacing   // 24pt
ComponentSpacing.cardPadding     // 16pt
ComponentSpacing.elementSpacing  // 12pt
ComponentSpacing.groupSpacing    // 8pt
```

## 🔘 Buttons

```typescript
import { Button } from '@/components/Button';

// Always use Button component (ensures 44pt minimum tap target):
<Button
  title="Action"
  onPress={handlePress}
  variant="primary"      // 'primary' | 'secondary' | 'outline' | 'text'
  size="large"           // 'large' | 'medium' | 'small'
  fullWidth={true}       // Optional
  disabled={false}       // Optional
  loading={false}        // Optional
  accessibilityLabel="Action button"
  accessibilityHint="Performs the action"
/>
```

## 📱 Safe Areas

```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Always wrap screens:
const insets = useSafeAreaInsets();

<SafeAreaView 
  style={{ flex: 1, backgroundColor: colors.background }}
  edges={['top', 'bottom']}  // or ['top', 'left', 'right', 'bottom']
>
  <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
    {/* Content */}
  </View>
</SafeAreaView>
```

## 📐 Device Adaptation

```typescript
import { useDeviceType } from '@/hooks/useDeviceType';

const { isIPad, isTablet, isPhone, maxContentWidth } = useDeviceType();

// For iPad, center content and limit width:
<ScrollView
  contentContainerStyle={{
    maxWidth: isIPad ? maxContentWidth : '100%',  // 672pt on iPad
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: isIPad ? 32 : 16,
  }}
>
  {/* Content */}
</ScrollView>
```

## ♿ Accessibility

```typescript
// Always add to interactive elements:
<TouchableOpacity
  accessibilityLabel="Button name"
  accessibilityHint="What happens when pressed"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
  {/* Content */}
</TouchableOpacity>

<TextInput
  accessibilityLabel="Input field name"
  accessibilityHint="What to enter"
  accessibilityRole="none"  // Screen reader reads placeholder
/>

<MaterialIcons
  name="icon-name"
  accessibilityLabel="Icon description"
  accessibilityHint="What happens when pressed"
  accessibilityRole="button"
/>
```

## 🎯 Common Patterns

### Screen Template

```typescript
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useDeviceType } from '@/hooks/useDeviceType';
import { Button } from '@/components/Button';
import { Spacing } from '@/constants/spacing';

export default function MyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isIPad, maxContentWidth } = useDeviceType();

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={{
          maxWidth: isIPad ? maxContentWidth : '100%',
          width: '100%',
          alignSelf: 'center',
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.lg,
          paddingBottom: Math.max(insets.bottom, Spacing.xl),
        }}
      >
        <Text style={[Typography.title1, { color: colors.text }]}>
          Screen Title
        </Text>
        
        <View style={{ marginTop: Spacing.lg }}>
          <Button
            title="Action"
            onPress={() => {}}
            variant="primary"
            size="large"
            fullWidth
            accessibilityLabel="Action"
            accessibilityHint="Performs action"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Component

```typescript
<View style={{
  backgroundColor: colors.card,
  borderRadius: 10,  // HIG standard
  padding: Spacing.md,
  marginBottom: Spacing.md,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
}}>
  {/* Card content */}
</View>
```

### Form Input

```typescript
<View style={{ marginBottom: Spacing.md }}>
  <Text style={[Typography.subhead, { color: colors.text, marginBottom: Spacing.xs }]}>
    Label
  </Text>
  <TextInput
    style={{
      height: 44,  // HIG minimum
      paddingHorizontal: Spacing.md,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      ...Typography.body,
    }}
    placeholder="Placeholder"
    placeholderTextColor={colors.textSecondary}
    accessibilityLabel="Input label"
    accessibilityHint="What to enter"
  />
</View>
```

## ❌ Common Mistakes to Avoid

1. **Don't use hard-coded colors:**
   ```typescript
   // ❌ Bad
   <View className="bg-white">
   
   // ✅ Good
   <View style={{ backgroundColor: colors.background }}>
   ```

2. **Don't use arbitrary font sizes:**
   ```typescript
   // ❌ Bad
   <Text className="text-[24px]">
   
   // ✅ Good
   <Text style={Typography.title3}>
   ```

3. **Don't use non-8pt spacing:**
   ```typescript
   // ❌ Bad
   <View style={{ padding: 20 }}>
   
   // ✅ Good
   <View style={{ padding: Spacing.lg }}>  // 24pt
   ```

4. **Don't create buttons smaller than 44pt:**
   ```typescript
   // ❌ Bad
   <TouchableOpacity style={{ height: 32 }}>
   
   // ✅ Good
   <Button size="large" />  // Automatically 44pt minimum
   ```

5. **Don't ignore safe areas:**
   ```typescript
   // ❌ Bad
   <View className="h-full">
   
   // ✅ Good
   <SafeAreaView edges={['top', 'bottom']}>
   ```

6. **Don't forget accessibility:**
   ```typescript
   // ❌ Bad
   <TouchableOpacity onPress={handlePress}>
   
   // ✅ Good
   <TouchableOpacity
     onPress={handlePress}
     accessibilityLabel="Button"
     accessibilityRole="button"
   >
   ```

## 📚 Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Pro Font Family](https://developer.apple.com/fonts/)
- [iOS Design Resources](https://developer.apple.com/design/resources/)
