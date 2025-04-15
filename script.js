const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHexdsbQDgTmda1GPmOIbpB0t1RICFizEimt-SVuVur__Y-5pEA4ZIEEm-BiGP_5ITk24ZYn_8KMwS/pub?output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n");
    const headers = rows[0].split(",");

    const labels = [];
    const followers = [], likes = [], posts = [], engagement = [];

    rows.slice(1).forEach(row => {
      const cols = row.split(",");
      labels.push(cols[0]);
      followers.push(parseInt(cols[1]));
      likes.push(parseInt(cols[2]));
      posts.push(parseInt(cols[3]));
      engagement.push(parseFloat(cols[4]));
    });

    const chartOptions = (label, color) => ({
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: eval(label.toLowerCase()), // dynamically gets the array
          backgroundColor: `${color}20`,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    new Chart(document.getElementById('followersChart').getContext('2d'), chartOptions('Followers', 'rgba(59, 130, 246, 1)'));
    new Chart(document.getElementById('likesChart').getContext('2d'), chartOptions('Likes', 'rgba(16, 185, 129, 1)'));
    new Chart(document.getElementById('postsChart').getContext('2d'), chartOptions('Posts', 'rgba(251, 191, 36, 1)'));
    new Chart(document.getElementById('engagementChart').getContext('2d'), chartOptions('Engagement', 'rgba(244, 63, 94, 1)'));
  })
  .catch(error => {
    console.error("Failed to fetch sheet data:", error);
  });
