# Internationalization (i18n) Guide

This guide explains the internationalization approach used in the Golden Gates web application and provides instructions for developers on how to properly internationalize components.

## Overview

The project uses [vue-i18n](https://vue-i18n.intlify.dev/) v9 for internationalization. Currently, only English is implemented, but the infrastructure supports adding additional languages.

## Directory Structure

```
web/src/locales/
├── en.json      # English translations
├── index.js     # i18n configuration
└── README.md    # This file
```

## Translation Key Organization

Translations in `en.json` are organized hierarchically using the Vue Component name when localizing strings from a Vue Component:

- **`app.*`** - General application strings
- **`componentTypes.*`** - Logic gate and component type names
- **`componentRegistry.*`** - Component addition actions
- **`componentInspector.*`** - Component property inspector strings
- **`commonFields.*`** - Common form field labels
- **`commonButtons.*`** - Common button labels
- **`fileOperations.*`** - File operation messages
- **`dialogs.*`** - Dialog messages
- **`validation.*`** - Validation error messages
- **`tabManager.*`** - Tab management strings
- **`menu.*`** - Menu items and categories
- **`[componentName].*`** - Component-specific strings

## Usage in Vue Components

### In Templates

Use the `$t()` function to access translations:

```vue
<template>
  <!-- Simple translation -->
  <Button :label="$t('commonButtons.save')" />
  
  <!-- Translation in text -->
  <p>{{ $t('componentInspector.emptyState') }}</p>
  
  <!-- Translation with parameters -->
  <span>{{ $t('fileOperations.errorLoading', { error: errorMessage }) }}</span>
  
  <!-- Translation in v-tooltip -->
  <Button v-tooltip="$t('languageSwitcher.tooltip')" />
</template>
```

### In Composition API

```javascript
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()
    
    // Use t() function in JavaScript
    const message = t('app.welcome')
    
    // Change locale
    locale.value = 'en'
    
    return { message }
  }
}
```

### In Options API

```javascript
export default {
  computed: {
    buttonLabel() {
      return this.$t('commonButtons.submit')
    }
  }
}
```

## Adding New Translations

When adding new components or features with user-facing strings:

1. **Add translation keys to `en.json`**:
   ```json
   {
     "myComponent": {
       "title": "My Component",
       "description": "This component does something",
       "actions": {
         "primary": "Do Action",
         "cancel": "Cancel"
       }
     }
   }
   ```

2. **Use consistent naming conventions**:
   - Use camelCase for key names
   - Group related strings under component names
   - Use descriptive key names that indicate the string's purpose

3. **For common UI elements**, use existing groups:
   - `commonButtons.*` for button labels
   - `commonFields.*` for form field labels
   - `validation.*` for validation messages
   - `dialogs.*` for dialog-related strings

## Best Practices

1. **Never hardcode user-facing strings**:
   ```vue
   <!-- Bad -->
   <Button label="Save" />
   
   <!-- Good -->
   <Button :label="$t('commonButtons.save')" />
   ```

2. **Use parameters for dynamic content**:
   ```json
   {
     "fileOperations": {
       "savedSuccessfully": "File '{filename}' saved successfully"
     }
   }
   ```
   ```vue
   {{ $t('fileOperations.savedSuccessfully', { filename: 'circuit.json' }) }}
   ```

3. **Group related translations**:
   - Component-specific strings under the component name
   - Shared strings under logical groups (commonButtons, validation, etc.)

4. **Keep translations concise and clear**:
   - Avoid overly technical language
   - Use consistent terminology throughout

5. **For error messages**, include context:
   ```json
   {
     "validation": {
       "component": {
         "missingLabel": "Component label is required",
         "duplicateId": "A component with ID '{id}' already exists"
       }
     }
   }
   ```

## Variable Substitution

Vue-i18n supports various interpolation features:

### Basic Interpolation
```json
{ "greeting": "Hello {name}!" }
```
```vue
{{ $t('greeting', { name: 'World' }) }}
```

### List Interpolation
```json
{ "list": "{0}, {1}, and {2}" }
```
```vue
{{ $t('list', ['Apple', 'Orange', 'Banana']) }}
```

### Named Interpolation with Formatting
```json
{ "balance": "Your balance is {amount, number, currency}" }
```

## Adding New Languages

To add a new language:

1. Create a new JSON file (e.g., `es.json` for Spanish) with the same structure as `en.json`
2. Import it in `index.js`:
   ```javascript
   import en from './en.json'
   import es from './es.json'
   
   const messages = {
     en,
     es
   }
   ```
3. Update the default locale if needed in `index.js`

## Current Status

As of the initial i18n implementation:
- ✅ Infrastructure is in place
- ✅ Key components have been internationalized
- ⚠️ Many components still have hardcoded strings
- ⚠️ Only English is currently implemented

When adding new features or modifying existing ones, please ensure all user-facing strings use the i18n system.