// Store current challenge
let currentChallenge = null;

// Load bosses when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBosses();
    loadHistory();
});

// Load all bosses and their enabled status
async function loadBosses() {
    try {
        const response = await fetch('/api/bosses');
        const bosses = await response.json();
        
        const bossListDiv = document.getElementById('boss-list');
        bossListDiv.innerHTML = '';
        
        bosses.forEach(boss => {
            const bossDiv = document.createElement('div');
            bossDiv.className = `boss-item ${boss.enabled ? 'enabled' : ''}`;
            bossDiv.onclick = () => toggleBoss(boss.name);
            
            bossDiv.innerHTML = `
                <div class="boss-checkbox"></div>
                <div class="boss-name">${boss.name}</div>
            `;
            
            bossListDiv.appendChild(bossDiv);
        });
    } catch (error) {
        console.error('Error loading bosses:', error);
    }
}

// Toggle a boss on/off
async function toggleBoss(bossName) {
    try {
        const response = await fetch(`/api/toggle/${bossName}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            loadBosses(); // Reload to show updated status
        }
    } catch (error) {
        console.error('Error toggling boss:', error);
    }
}

// Generate a new challenge
async function generateChallenge() {
    try {
        const response = await fetch('/api/generate');
        
        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Error generating challenge');
            return;
        }
        
        const challenge = await response.json();
        currentChallenge = challenge;
        
        const displayDiv = document.getElementById('challenge-display');
        displayDiv.className = 'challenge-box active';
        displayDiv.innerHTML = `<p>Kill ${challenge.kills} x ${challenge.boss}</p>`;
        
        document.getElementById('complete-btn').disabled = false;
        
    } catch (error) {
        console.error('Error generating challenge:', error);
        alert('Error generating challenge');
    }
}

// Mark current challenge as complete
async function completeChallenge() {
    if (!currentChallenge) return;
    
    try {
        const response = await fetch('/api/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentChallenge)
        });
        
        if (response.ok) {
            alert(`✓ Completed: ${currentChallenge.kills}x ${currentChallenge.boss}`);
            
            // Clear current challenge
            currentChallenge = null;
            const displayDiv = document.getElementById('challenge-display');
            displayDiv.className = 'challenge-box';
            displayDiv.innerHTML = '<p>Challenge completed! Generate a new one.</p>';
            document.getElementById('complete-btn').disabled = true;
            
            // Reload history
            loadHistory();
        }
    } catch (error) {
        console.error('Error completing challenge:', error);
        alert('Error completing challenge');
    }
}

// Load completion history
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const history = await response.json();
        
        const historyDiv = document.getElementById('history-list');
        
        if (history.length === 0) {
            historyDiv.innerHTML = '<div class="empty-message">No completed challenges yet!</div>';
            return;
        }
        
        historyDiv.innerHTML = '';
        
        // Show most recent first
        history.reverse().forEach((entry, index) => {
            const date = new Date(entry.completed);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'history-item';
            itemDiv.innerHTML = `
                <button class="delete-btn" onclick="deleteHistoryItem(${index})">×</button>
                <div class="date">${dateStr}</div>
                <div class="challenge">${entry.kills}x ${entry.boss}</div>
            `;
            
            historyDiv.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

async function deleteHistoryItem(index) {
 try {
    const response = await fetch(`api/history/${index}`, {method: `DELETE`});

    if (response.ok){
    loadHistory();
    }

 } catch (error) {
    console.error('Error deleting: ', error);
 }

 

}