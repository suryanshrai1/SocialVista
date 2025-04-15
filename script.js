const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHexdsbQDgTmda1GPmOIbpB0t1RICFizEimt-SVuVur__Y-5pEA4ZIEEm-BiGP_5ITk24ZYn_8KMwS/pub?output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n");
    const labels = [];
    const followers = [];
    const likes = [];
    const posts = [];
    const engagement = [];

    rows.slice(1).forEach(row => {
      const cols = row.split(",");
      labels.push(cols[0]);
      followers.push(parseInt(cols[1]));
      likes.push(parseInt(cols[2]));
      posts.push(parseInt(cols[3]));
      engagement.push(parseFloat(cols[4]));
    });

    // Chart rendering
    function createChart(ctxId, label, data, color) {
      const ctx = document.getElementById(ctxId).getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: label,
            data: data,
            backgroundColor: `${color}20`,
            borderColor: color,
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

    createChart('followersChart', 'Followers', followers, 'rgba(59, 130, 246, 1)');
    createChart('likesChart', 'Likes', likes, 'rgba(16, 185, 129, 1)');
    createChart('postsChart', 'Posts', posts, 'rgba(251, 191, 36, 1)');
    createChart('engagementChart', 'Engagement', engagement, 'rgba(244, 63, 94, 1)');

    // Notification tracking
    const lastStats = JSON.parse(localStorage.getItem("lastStats")) || {};
    const allNotifications = JSON.parse(localStorage.getItem("notifications")) || [];

    const latest = {
      followers: followers.at(-1),
      likes: likes.at(-1),
      posts: posts.at(-1),
      engagement: engagement.at(-1)
    };

    const newNotifs = [];

    if (lastStats.followers !== undefined && latest.followers !== lastStats.followers) {
      const diff = latest.followers - lastStats.followers;
      newNotifs.push(`📈 Followers ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
    }

    if (lastStats.likes !== undefined && latest.likes !== lastStats.likes) {
      const diff = latest.likes - lastStats.likes;
      newNotifs.push(`❤️ Likes ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
    }

    if (lastStats.posts !== undefined && latest.posts !== lastStats.posts) {
      const diff = latest.posts - lastStats.posts;
      newNotifs.push(`📝 Posts ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff)}`);
    }

    if (lastStats.engagement !== undefined && latest.engagement !== lastStats.engagement) {
      const diff = (latest.engagement - lastStats.engagement).toFixed(1);
      newNotifs.push(`📊 Engagement ${diff > 0 ? 'rose' : 'dropped'} by ${Math.abs(diff)}%`);
    }

    // Save all new notifications with timestamps
    const timestamped = newNotifs.map(msg => ({
      message: msg,
      timestamp: new Date().toISOString()
    }));

    const updatedNotifications = [...allNotifications, ...timestamped];
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    localStorage.setItem("lastStats", JSON.stringify(latest));

    // Update the Recent Notifications section (show most recent one only)
    const notifList = document.getElementById("notificationList");
    if (timestamped.length > 0 && notifList) {
      const latestNotif = timestamped.at(-1);
      const li = document.createElement("li");
      li.innerHTML = `<span class="font-medium">${latestNotif.message}</span><br><small class="text-gray-500">${new Date(latestNotif.timestamp).toLocaleString()}</small>`;
      li.className = "text-gray-700 font-medium";
      notifList.appendChild(li);
    }
  })
  .catch(err => console.error("Error loading data:", err));
