// DOM Elements
const elements = {
  stats: document.getElementById('stats'),
  candidatesGrid: document.getElementById('candidatesGrid'),
  searchInput: document.getElementById('q'),
  jobForm: document.querySelector('.job-form'),
  filterTabs: document.querySelectorAll('.filter-tab'),
  menuItems: document.querySelectorAll('.menu-item'),
  sidebar: document.querySelector('.sidebar'),
  avatar: document.querySelector('.avatar'),
  notificationBtn: document.querySelector('.btn-ghost[title="Notifications"]'),
  postJobBtn: document.querySelector('.btn-primary:not(.job-form .btn-primary)')
};

// State management
const state = {
  candidates: [],
  filteredCandidates: [],
  activeFilter: 'all',
  notifications: [
    { id: 1, text: 'New candidate applied for Frontend role', read: false, time: '10 min ago' },
    { id: 2, text: 'AI detected potential issues in 3 resumes', read: false, time: '25 min ago' },
    { id: 3, text: 'Your job posting was viewed 42 times', read: true, time: '2 hours ago' }
  ],
  unreadNotifications: 2
};

// Initialize the application
function init() {
  animateStats();
  setupEventListeners();
  loadCandidates();
  updateNotificationBadge();
  setupMenuActiveState();
}

// Animate statistics counters
function animateStats() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseInt(el.dataset.target || el.textContent.replace(/[^0-9]/g, '') || 0, 10);
    if (!target) return;
    
    let start = 0;
    const dur = 900;
    const stepTime = Math.max(12, Math.floor(dur / target));
    const isPercentage = el.textContent.includes('%');
    
    const timer = setInterval(() => {
      start += Math.ceil(target / (dur / stepTime));
      if (start >= target) {
        el.textContent = target + (isPercentage ? '%' : '');
        clearInterval(timer);
      } else {
        el.textContent = start + (isPercentage ? '%' : '');
      }
    }, stepTime);
  });
}

// Load and display candidate data
function loadCandidates() {
  // In a real app, this would be an API call
  const mockCandidates = [
    {
      id: 1,
      name: 'Rahul Sharma',
      title: 'Senior Frontend Developer',
      matchScore: 92,
      skills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
      experience: '5 years',
      aiWarning: false
    },
    {
      id: 2,
      name: 'Priya Mehta',
      title: 'UX Designer',
      matchScore: 87,
      skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
      experience: '3 years',
      aiWarning: false
    },
    {
      id: 3,
      name: 'Shubham Desai',
      title: 'Backend Engineer',
      matchScore: 85,
      skills: ['Python', 'Django', 'AWS', 'PostgreSQL'],
      experience: '4 years',
      aiWarning: true,
      aiProbability: 78
    },
    {
      id: 4,
      name: 'Ananya Patel',
      title: 'Product Manager',
      matchScore: 89,
      skills: ['Product Strategy', 'Agile', 'Market Research', 'JIRA'],
      experience: '6 years',
      aiWarning: false
    },
    {
      id: 5,
      name: 'Vikram Singh',
      title: 'DevOps Engineer',
      matchScore: 82,
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      experience: '3 years',
      aiWarning: false
    },
    {
      id: 6,
      name: 'Neha Gupta',
      title: 'Data Scientist',
      matchScore: 65,
      skills: ['Python', 'Machine Learning', 'Pandas'],
      experience: '1 year',
      aiWarning: true,
      aiProbability: 92
    }
  ];

  state.candidates = mockCandidates;
  state.filteredCandidates = mockCandidates;
  renderCandidates();
}

// Render candidates to the grid
function renderCandidates() {
  elements.candidatesGrid.innerHTML = '';
  
  state.filteredCandidates.forEach((candidate, index) => {
    const card = document.createElement('div');
    card.className = `candidate-card ${candidate.aiWarning ? 'has-warning' : ''}`;
    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="candidate-name">${candidate.name}</div>
          <div class="candidate-title">${candidate.title}</div>
        </div>
        <div class="match-score ${getMatchScoreClass(candidate.matchScore)} badge-pop">
          ${candidate.matchScore}%
        </div>
      </div>
      <div class="skills-section">
        <div class="skills-title">Top Skills:</div>
        <div class="skills-list">
          ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
      ${candidate.aiWarning ? `
        <div class="ai-warning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">AI-generated content detected (${candidate.aiProbability}% probability)</span>
        </div>
      ` : ''}
      <div class="card-footer">
        <a href="#" class="view-btn" data-id="${candidate.id}">View Profile</a>
        <span class="experience">${candidate.experience} experience</span>
      </div>
    `;
    
    elements.candidatesGrid.appendChild(card);
    
    // Add staggered animation
    setTimeout(() => {
      card.classList.add('revealed');
    }, index * 110);
  });

  // Add event listeners to view buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const candidateId = parseInt(btn.dataset.id, 10);
      viewCandidateProfile(candidateId);
    });
  });
}

// Filter candidates based on search term
function filterCandidates() {
  const term = elements.searchInput.value.toLowerCase().trim();
  
  state.filteredCandidates = state.candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(term) ||
      candidate.title.toLowerCase().includes(term) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(term));
    
    const matchesFilter = 
      state.activeFilter === 'all' ||
      (state.activeFilter === 'shortlisted' && candidate.matchScore >= 85) ||
      (state.activeFilter === 'ai-flagged' && candidate.aiWarning) ||
      (state.activeFilter === 'new' && candidate.experience.includes('1 year'));
    
    return matchesSearch && matchesFilter;
  });
  
  renderCandidates();
}

// View candidate profile
function viewCandidateProfile(id) {
  const candidate = state.candidates.find(c => c.id === id);
  if (!candidate) return;
  
  // In a real app, this would open a modal or navigate to a profile page
  alert(`Viewing profile for ${candidate.name}\n\n` +
        `Role: ${candidate.title}\n` +
        `Match Score: ${candidate.matchScore}%\n` +
        `Experience: ${candidate.experience}\n` +
        `Top Skills: ${candidate.skills.join(', ')}`);
}

// Get CSS class for match score
function getMatchScoreClass(score) {
  if (score >= 85) return 'match-high';
  if (score >= 70) return 'match-medium';
  return 'match-low';
}

// Handle job form submission
function handleJobFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('job-title').value,
    department: document.getElementById('department').value,
    description: document.getElementById('description').value,
    skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
    experience: document.getElementById('experience').value
  };
  
  if (!formData.title || !formData.department || !formData.description) {
    alert('Please fill in all required fields');
    return;
  }
  
  // In a real app, this would be an API call
  console.log('Job posting submitted:', formData);
  alert('Job posted successfully!');
  e.target.reset();
  
  // Add to notifications
  addNotification(`New job posted: ${formData.title}`);
}

// Notification functions
function addNotification(text) {
  const newNotification = {
    id: Date.now(),
    text,
    read: false,
    time: 'Just now'
  };
  
  state.notifications.unshift(newNotification);
  state.unreadNotifications++;
  updateNotificationBadge();
}

function markNotificationsAsRead() {
  state.notachments.forEach(n => n.read = true);
  state.unreadNotifications = 0;
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = elements.notificationBtn.querySelector('.badge');
  
  if (state.unreadNotifications > 0) {
    if (!badge) {
      const newBadge = document.createElement('span');
      newBadge.className = 'badge';
      newBadge.textContent = state.unreadNotifications;
      newBadge.style.position = 'absolute';
      newBadge.style.top = '-5px';
      newBadge.style.right = '-5px';
      newBadge.style.backgroundColor = 'var(--danger)';
      newBadge.style.color = 'white';
      newBadge.style.borderRadius = '50%';
      newBadge.style.width = '18px';
      newBadge.style.height = '18px';
      newBadge.style.fontSize = '10px';
      newBadge.style.display = 'flex';
      newBadge.style.alignItems = 'center';
      newBadge.style.justifyContent = 'center';
      elements.notificationBtn.style.position = 'relative';
      elements.notificationBtn.appendChild(newBadge);
    } else {
      badge.textContent = state.unreadNotifications;
    }
  } else if (badge) {
    badge.remove();
  }
}

// Show notifications dropdown
function showNotifications() {
  markNotificationsAsRead();
  
  // Remove existing dropdown if it exists
  const existingDropdown = document.querySelector('.notifications-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
    return;
  }
  
  const dropdown = document.createElement('div');
  dropdown.className = 'notifications-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.top = 'calc(100% + 10px)';
  dropdown.style.right = '0';
  dropdown.style.backgroundColor = 'white';
  dropdown.style.borderRadius = 'var(--radius)';
  dropdown.style.boxShadow = 'var(--shadow)';
  dropdown.style.width = '320px';
  dropdown.style.maxHeight = '400px';
  dropdown.style.overflow = 'auto';
  dropdown.style.zIndex = '50';
  dropdown.style.padding = '12px';
  
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '12px';
  header.style.paddingBottom = '8px';
  header.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
  
  const title = document.createElement('h3');
  title.textContent = 'Notifications';
  title.style.fontSize = '1rem';
  title.style.fontWeight = '700';
  
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear All';
  clearBtn.style.background = 'none';
  clearBtn.style.border = 'none';
  clearBtn.style.color = 'var(--primary)';
  clearBtn.style.fontWeight = '600';
  clearBtn.style.fontSize = '0.8rem';
  clearBtn.style.cursor = 'pointer';
  clearBtn.addEventListener('click', () => {
    state.notifications = [];
    dropdown.remove();
  });
  
  header.appendChild(title);
  header.appendChild(clearBtn);
  dropdown.appendChild(header);
  
  if (state.notifications.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'No notifications';
    empty.style.textAlign = 'center';
    empty.style.padding = '20px';
    empty.style.color = 'var(--muted)';
    dropdown.appendChild(empty);
  } else {
    state.notifications.forEach(notification => {
      const item = document.createElement('div');
      item.style.padding = '10px';
      item.style.marginBottom = '8px';
      item.style.borderRadius = '8px';
      item.style.backgroundColor = notification.read ? 'white' : 'rgba(79,70,229,0.05)';
      item.style.borderLeft = notification.read ? 'none' : '3px solid var(--primary)';
      
      const text = document.createElement('div');
      text.textContent = notification.text;
      text.style.marginBottom = '4px';
      
      const time = document.createElement('div');
      time.textContent = notification.time;
      time.style.fontSize = '0.75rem';
      time.style.color = 'var(--muted)';
      
      item.appendChild(text);
      item.appendChild(time);
      dropdown.appendChild(item);
    });
  }
  
  elements.notificationBtn.parentNode.appendChild(dropdown);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function closeDropdown(e) {
    if (!dropdown.contains(e.target) && e.target !== elements.notificationBtn) {
      dropdown.remove();
      document.removeEventListener('click', closeDropdown);
    }
  });
}

// Set up menu active state
function setupMenuActiveState() {
  elements.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      elements.menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // In a real app, this would load the appropriate view
      console.log(`Navigating to ${item.textContent.trim()}`);
    });
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Search input
  elements.searchInput.addEventListener('input', filterCandidates);
  
  // Filter tabs
  elements.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active filter based on tab text
      const tabText = tab.textContent.toLowerCase();
      if (tabText.includes('all')) state.activeFilter = 'all';
      else if (tabText.includes('shortlisted')) state.activeFilter = 'shortlisted';
      else if (tabText.includes('flagged')) state.activeFilter = 'ai-flagged';
      else if (tabText.includes('new')) state.activeFilter = 'new';
      
      filterCandidates();
    });
  });
  
  // Job form
  if (elements.jobForm) {
    elements.jobForm.addEventListener('submit', handleJobFormSubmit);
  }
  
  // Post job button
  if (elements.postJobBtn) {
    elements.postJobBtn.addEventListener('click', () => {
      document.querySelector('.job-posting').scrollIntoView({
        behavior: 'smooth'
      });
      document.getElementById('job-title').focus();
    });
  }
  
  // Notifications
  if (elements.notificationBtn) {
    elements.notificationBtn.addEventListener('click', showNotifications);
  }
  
  // Avatar click (could open user profile)
  if (elements.avatar) {
    elements.avatar.addEventListener('click', () => {
      alert('User profile menu would open here');
    });
  }
  
  // Responsive sidebar toggle (for mobile)
  window.addEventListener('resize', () => {
    if (window.innerWidth < 880) {
      elements.sidebar.style.display = 'none';
    } else {
      elements.sidebar.style.display = 'block';
    }
  });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);