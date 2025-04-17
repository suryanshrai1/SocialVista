const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHexdsbQDgTmda1GPmOIbpB0t1RICFizEimt-SVuVur__Y-5pEA4ZIEEm-BiGP_5ITk24ZYn_8KMwS/pub?output=csv";

// Load and display notifications in the dashboard
function loadDashboardNotifications() {
  let notifications = [];
  try {
    notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  } catch (e) {
    console.warn("Error reading notifications from localStorage. Resetting...");
    localStorage.removeItem("notifications");
  }

  const list = document.getElementById("notificationList");
  if (!list) return;

  list.innerHTML = "";

  // Show only the 5 most recent notifications
  notifications.slice(-5).reverse().forEach(notif => {
    const li = document.createElement("li");
    li.className = "text-gray-700 font-medium bg-gray-50 p-3 rounded";
    li.innerHTML = `
      <span>${notif.message}</span><br>
      <small class="text-gray-500">${new Date(notif.timestamp).toLocaleString()}</small>
    `;
    list.appendChild(li);
  });
}

// Create a new notification
function createNotification(message) {
  let notifications = [];
  try {
    notifications = JSON.parse(localStorage.getItem("notifications")) || [];
  } catch (e) {
    notifications = [];
  }

  const newNotification = {
    id: Date.now().toString(),
    message: message,
    timestamp: new Date().toISOString()
  };

  notifications.push(newNotification);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  loadDashboardNotifications();
}

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n");
    const data = rows.slice(1).reduce((acc, row) => {
      const [date, followers, likes, posts, engagement] = row.split(",");
      return {
        labels: [...acc.labels, date],
        followers: [...acc.followers, parseInt(followers)],
        likes: [...acc.likes, parseInt(likes)],
        posts: [...acc.posts, parseInt(posts)],
        engagement: [...acc.engagement, parseFloat(engagement)]
      };
    }, {
      labels: [],
      followers: [],
      likes: [],
      posts: [],
      engagement: []
    });

    // Reset localStorage if not enough data
    if (data.labels.length < 2) {
      localStorage.removeItem("lastProcessedState");
      localStorage.removeItem("notifications");
      return;
    }

    // Chart rendering
    function createChart(ctxId, label, dataSet, color) {
      const ctx = document.getElementById(ctxId)?.getContext('2d');
      if (!ctx) return;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: label,
            data: dataSet,
            backgroundColor: `${color}33`,
            borderColor: color,
            pointBackgroundColor: color,
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Render all 4 charts
    createChart('followersChart', 'Followers', data.followers, '#3b82f6');
    createChart('likesChart', 'Likes', data.likes, '#10b981');
    createChart('postsChart', 'Posts', data.posts, '#f59e0b');
    createChart('engagementChart', 'Engagement', data.engagement, '#ef4444');

    // Safe access to localStorage for state
    // Get the last 2 rows (latest and second latest)
const latestRow = rows.at(-1);
const prevRow = rows.at(-2);

// Use full latest row as a unique key
const rowHash = latestRow;

// Compare to last processed row hash
let lastRowHash = localStorage.getItem("lastRowHash");

// Only proceed if the latest row is different
if (rowHash !== lastRowHash) {
  const [_, followers, likes, posts, engagement] = latestRow.split(",");
  const [__, prevFollowers, prevLikes, prevPosts, prevEngagement] = prevRow.split(",");

  const currentState = {
    followers: parseInt(followers),
    likes: parseInt(likes),
    posts: parseInt(posts),
    engagement: parseFloat(parseFloat(engagement).toFixed(1))
  };

  const previousState = {
    followers: parseInt(prevFollowers),
    likes: parseInt(prevLikes),
    posts: parseInt(prevPosts),
    engagement: parseFloat(parseFloat(prevEngagement).toFixed(1))
  };

  if (currentState.followers !== previousState.followers) {
    const diff = currentState.followers - previousState.followers;
    createNotification(`📈 Followers ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
  }

  if (currentState.likes !== previousState.likes) {
    const diff = currentState.likes - previousState.likes;
    createNotification(`❤️ Likes ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
  }

  if (currentState.posts !== previousState.posts) {
    const diff = currentState.posts - previousState.posts;
    createNotification(`📝 Posts ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
  }

  if (currentState.engagement !== previousState.engagement) {
    const diff = (currentState.engagement - previousState.engagement).toFixed(1);
    createNotification(`📊 Engagement ${diff > 0 ? 'rose' : 'dropped'} by ${Math.abs(diff)}%`);
  }

  // ✅ Save row hash to prevent duplicate processing
  localStorage.setItem("lastRowHash", rowHash);
}



    // Detect genuine changes (not just reload)
    if (!lastProcessedState || JSON.stringify(currentState) !== JSON.stringify(lastProcessedState)) {
      if (currentState.followers !== previousState.followers) {
        const diff = currentState.followers - previousState.followers;
        createNotification(`📈 Followers ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
      }

      if (currentState.likes !== previousState.likes) {
        const diff = currentState.likes - previousState.likes;
        createNotification(`❤️ Likes ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
      }

      if (currentState.posts !== previousState.posts) {
        const diff = currentState.posts - previousState.posts;
        createNotification(`📝 Posts ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
      }

      if (currentState.engagement !== previousState.engagement) {
        const diff = (currentState.engagement - previousState.engagement).toFixed(1);
        createNotification(`📊 Engagement ${diff > 0 ? 'rose' : 'dropped'} by ${Math.abs(diff)}%`);
      }

      localStorage.setItem("lastProcessedState", JSON.stringify(currentState));
    }

    // Initial notification list
    loadDashboardNotifications();
  })
  .catch(err => console.error("Error loading data:", err));
