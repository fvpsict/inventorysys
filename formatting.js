// formatting.js

function formatColumnHeader(column) {
    const headerMap = {
        'equipmentType': 'Equipment Type',
        'vendor': 'Vendor',
        'brandModel': 'Brand & Model',
        'profile': 'Profile',
        'custodian': 'Custodian',
        'assetNo': 'Asset No',
        'serialNo': 'Serial No',
        'location': 'Location',
        'startDate': 'Start Date',
        'endDate': 'End Date',
        'hostname': 'Hostname',
        'ssoePONumber': 'SSOE PO Number',
        'cartNo': 'Cart No',
        'fault': 'Fault',
        'room': 'Room',
        'roomNo': 'Room No',
        'lampHour': 'Lamp Hour',
        'durationInUse': 'Duration in Use'
    };
    
    return headerMap[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}
