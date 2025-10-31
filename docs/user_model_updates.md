# User Model and API Updates Documentation

## Changes Implemented on October 31, 2025

### 1. User Model Schema Updates

Added new fields to the MongoDB User Schema:

```javascript
gender: {
  type: String,
  enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  default: 'Prefer not to say'
}

sport: {
  type: String,
  required: true
}

cricketRole: {
  type: String,
  enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
  required: function() { return this.sport === 'Cricket'; }
}
```

### 2. Validation Updates

- Updated `roleFields.js` to include new required fields for each role
- Added validation rules in `validation.js` for:
  - Gender validation
  - Sport requirement
  - Conditional cricket role validation
  - Profile update validations

### 3. API Endpoint Updates

#### Registration Endpoint
- Now accepts gender, sport, and cricketRole fields
- Implements conditional validation for cricket players
- Updates both regular and Google OAuth registration flows

#### Profile Update Endpoint
- Handles updates to new fields
- Validates sport changes and their impact on cricketRole
- Maintains data consistency when switching sports

### 4. Testing

Created a new test script (`tests/user_fields_test.sh`) that verifies:
- Cricket player registration with valid data
- Non-cricket player registration
- Profile updates
- Invalid cricket role validation
- Missing cricket role validation

### Usage Examples

#### Register a Cricket Player
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "player",
  "age": 25,
  "playingRole": "Batsman",
  "sport": "Cricket",
  "gender": "Male",
  "cricketRole": "Batsman"
}
```

#### Register a Non-Cricket Player
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "player",
  "age": 23,
  "playingRole": "Forward",
  "sport": "Football",
  "gender": "Female"
}
```

### Testing
To test the new changes:
1. Ensure the server is running (`npm start`)
2. Run the test script: `./tests/user_fields_test.sh`