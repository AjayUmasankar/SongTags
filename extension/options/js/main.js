import { BackendNotifier } from '../../';


// Doughnut Chart
var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
var myChart6 = new Chart(ctx6, {
    type: "doughnut",
    data: {
        labels: ["Italy", "France", "Spain", "USA", "Argentina"],
        datasets: [{
            backgroundColor: [
                "rgba(235, 22, 22, .7)",
                "rgba(235, 22, 22, .6)",
                "rgba(235, 22, 22, .5)",
                "rgba(235, 22, 22, .4)",
                "rgba(235, 22, 22, .3)"
            ],
            data: [55, 49, 44, 24, 15]
        }]
    },
    options: {
        responsive: true
    }
});