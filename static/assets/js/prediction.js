document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("prediction-form");

    form.addEventListener("submit", () => {

        const data = Object.fromEntries(new FormData(form));

        // Convert number fields
        Object.keys(data).forEach(key => {
            if (!isNaN(data[key])) {
                data[key] = Number(data[key]);
            }
        });

        // Save
        sessionStorage.setItem("predictionData", JSON.stringify(data));
    });

});
