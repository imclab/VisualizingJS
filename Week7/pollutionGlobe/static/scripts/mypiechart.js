var renderChart = function(year){
    var continent = []
    var contPollution = []
    var total = 0

    $.getJSON('scripts/regions.json', function(data) {

        data.sort(function(a,b) { return parseFloat(a.pollution[year]) - parseFloat(b.pollution[year]) } );

        for(var i=data.length-1; i>=0; i--){

            var thisContintent = data[i].region
            var thisPollution = Math.round(data[i].pollution[year] * 1000000)
            total += thisPollution

            continent.push(thisContintent)
            contPollution.push(thisPollution)
            if(i == 0)
                startChart()
        }

    })



    var startChart = function(){

        chart = new Highcharts.Chart({
            chart: {
                renderTo: 'pie-chart',
                type: 'pie',
                backgroundColor: 'rgba(0, 0, 0, 0)',
            },
            title: {
                text: ''
            },
            yAxis: {
                title: {
                    text: 'Total percent market share'
                }
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    animation:{duration: 700},
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,.5)'
                },
            },
            tooltip: {
               formatter: function() {
                    return this.y.toFixed(2) +' %';
                },
                percentageDecimals: 2,
                borderWidth: 0,
                borderRadius: 0,
                distance: 0,
                padding: 5,
                backgroundColor: "rgba(0,0,0,0)",
                shadow:false,
                style: {color: 'white'},
                // enabled: false
                
            },
                colors: ['#ff0000', '#fd4c4c', '#fc8a8a', '#fac0c0', '#fdeaea', '#ffffff' , '#ffffff']
            ,
            exporting: {
                    buttons: {

                   printButton:{
                     enabled:false
                   },
                   exportButton: {
                       enabled:false
                   }

                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Continents',
                data: [[continent[0]+"<br/>"+addCommas(contPollution[0]), contPollution[0]/total*100],
                       [continent[1]+"<br/>"+addCommas(contPollution[1]), contPollution[1]/total*100],
                       [continent[2]+"<br/>"+addCommas(contPollution[2]), contPollution[2]/total*100],
                       [continent[3]+"<br/>"+addCommas(contPollution[3]), contPollution[3]/total*100],
                       [continent[4]+"<br/>"+addCommas(contPollution[4]), contPollution[4]/total*100],
                       [continent[5]+"<br/>"+addCommas(contPollution[5]), contPollution[5]/total*100],
                       [continent[6]+"<br/>"+addCommas(contPollution[6]), contPollution[6]/total*100],
                      ],
                size: '66%',
                innerSize: '63%',
                showInLegend:false,
                dataLabels: {
                    enabled: true,
                    color: 'white',
                }
            }]
        });
    }
}