document.addEventListener("DOMContentLoaded", () => {

    const div = document.getElementById("output-content");

    let data = sessionStorage.getItem("predictionData");
    if (!data) {
        div.innerHTML = "<p>No data found. Please try again.</p>";
        return;
    }

    data = JSON.parse(data);

    const isAttack = data.prediction_result === "instruction";
    const confidence = data.confidence || 0;

    // 🔔 PLAY ALERT SOUND ONLY FOR ATTACK
    if (isAttack) {
        const sound = new Audio('/static/assets/src/alert-109578.mp3');
        sound.play().catch(() => {});
    }

    const html = `
        <div class="demo-result-card ${isAttack ? "result-danger" : "result-success"}">
            <div class="demo-result-icon">${isAttack ? "🚨" : "✅"}</div>
            
            <div class="demo-result-content">

                <h2 class="demo-result-title">
                    ${isAttack ? "⚠️ ATTACK DETECTED" : "✔ Normal Traffic"}
                </h2>

                <p class="demo-result-message">
                    ${isAttack ?
                        "Suspicious malicious traffic detected! Immediate attention required." :
                        "No malicious behavior detected. Traffic is safe."}
                </p>

                <div class="demo-result-details">
                    <div class="demo-detail-item">
                        <span class="demo-detail-label">Confidence</span>
                        <span class="demo-detail-value">${confidence}%</span>
                    </div>
                </div>

            </div>
        </div>
    `;

    div.innerHTML = html;
});
