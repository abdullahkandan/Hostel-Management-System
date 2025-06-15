document.addEventListener('DOMContentLoaded', function() {
    const roomSelect = document.getElementById('room-select');
    const checkOccupancyBtn = document.getElementById('check-occupancy');
    const occupancyResult = document.getElementById('occupancy-result');
    const roomTitle = document.getElementById('room-title');
    const occupancyBadge = document.getElementById('occupancy-badge');
    const totalCapacity = document.getElementById('total-capacity');
    const currentlyOccupied = document.getElementById('currently-occupied');
    const availableBeds = document.getElementById('available-beds');
    const residentsSection = document.getElementById('residents-section');
    const residentsList = document.getElementById('residents-list');
    const vacantSection = document.getElementById('vacant-section');
    
    checkOccupancyBtn.addEventListener('click', function() {
        const selectedRoom = roomSelect.value;
        
        if (!selectedRoom) {
            showToast('Please select a room to check occupancy', 'error');
            return;
        }
        
        // Show loading state
        checkOccupancyBtn.textContent = 'Checking Occupancy...';
        checkOccupancyBtn.disabled = true;
        
        // Fetch room data from API
        fetch(`api_room_occupancy.php?roomNumber=${encodeURIComponent(selectedRoom)}`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                displayOccupancyData(selectedRoom, result.data);
                showToast(`Occupancy data loaded for Room ${selectedRoom}`, 'success');
            } else {
                showToast(result.message, 'error');
            }
            
            checkOccupancyBtn.textContent = 'Check Occupancy';
            checkOccupancyBtn.disabled = false;
            
            occupancyResult.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            showToast('Error fetching occupancy data: ' + error.message, 'error');
            checkOccupancyBtn.textContent = 'Check Occupancy';
            checkOccupancyBtn.disabled = false;
        });
    });
    
    function displayOccupancyData(roomNumber, data) {
        roomTitle.textContent = `Room ${roomNumber} - Occupancy Details`;
        
        // Update statistics
        totalCapacity.textContent = data.capacity;
        currentlyOccupied.textContent = data.occupied;
        availableBeds.textContent = data.capacity - data.occupied;
        
        // Determine occupancy status
        const status = getOccupancyStatus(data);
        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);
        
        occupancyBadge.textContent = statusText;
        occupancyBadge.className = `status-badge ${statusClass}`;
        
        // Show/hide sections based on occupancy
        if (data.students.length > 0) {
            displayResidents(data.students);
            residentsSection.style.display = 'block';
            vacantSection.style.display = 'none';
        } else {
            residentsSection.style.display = 'none';
            vacantSection.style.display = 'block';
        }
        
        // Show the result card
        occupancyResult.style.display = 'block';
    }
    
    function displayResidents(students) {
        residentsList.innerHTML = '';
        
        students.forEach((student, index) => {
            if (student.trim()) {
                const residentCard = document.createElement('div');
                residentCard.className = 'resident-card';
                
                residentCard.innerHTML = `
                    <div class="resident-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="resident-info">
                        <h4>${student}</h4>
                        <p>Bed ${index + 1}</p>
                    </div>
                `;
                
                residentsList.appendChild(residentCard);
            }
        });
    }
    
    function getOccupancyStatus(data) {
        if (data.occupied === 0) return 'vacant';
        if (data.occupied === data.capacity) return 'full';
        return 'partial';
    }
    
    function getStatusText(status) {
        switch (status) {
            case 'vacant': return 'Vacant';
            case 'full': return 'Fully Occupied';
            case 'partial': return 'Partially Occupied';
            default: return 'Unknown';
        }
    }
    
    function getStatusClass(status) {
        switch (status) {
            case 'vacant': return 'status-vacant';
            case 'full': return 'status-full';
            case 'partial': return 'status-partial';
            default: return '';
        }
    }
});

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        toast.style.background = '#4caf50';
    } else if (type === 'error') {
        toast.style.background = '#f44336';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}