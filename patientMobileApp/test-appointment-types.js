// Test script to verify appointment types
const appointmentTypes = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'routine', label: 'Routine Check-up' },
];

console.log('=== APPOINTMENT TYPES TEST ===');
console.log('Total appointment types:', appointmentTypes.length);
console.log('Appointment types:');
appointmentTypes.forEach((type, index) => {
  console.log(`${index + 1}. ${type.label} (${type.value})`);
});

// Test if all types are unique
const values = appointmentTypes.map(t => t.value);
const labels = appointmentTypes.map(t => t.label);
const uniqueValues = [...new Set(values)];
const uniqueLabels = [...new Set(labels)];

console.log('\n=== VALIDATION ===');
console.log('Unique values:', uniqueValues.length === values.length ? '✅ All unique' : '❌ Duplicates found');
console.log('Unique labels:', uniqueLabels.length === labels.length ? '✅ All unique' : '❌ Duplicates found');

// Test default selection
const defaultType = appointmentTypes[0];
console.log('\n=== DEFAULT SELECTION ===');
console.log('Default type:', defaultType.label, `(${defaultType.value})`);

// Test finding a type
const testType = 'emergency';
const foundType = appointmentTypes.find(t => t.value === testType);
console.log(`\n=== FINDING TYPE "${testType}" ===`);
console.log('Found:', foundType ? foundType.label : 'Not found');

console.log('\n✅ Appointment types test completed!'); 