function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample

    var metadata_url = `/metadata/${sample}`;
    d3.json(metadata_url).then(function(response) {
      // Use `Object.entries` to add each key and value pair to the panel
      var metadata_sample = Object.entries(response);
      // console.log(metadata_sample);
      // Use `.html("") to clear any existing metadata
      d3.select("div#sample-metadata").html("");
      metadata_sample.forEach(([key, value]) => {
        // Use d3 to select the panel with id of `#sample-metadata`
        d3.select("div#sample-metadata")
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        .append("p")
        .text(`${key}: ${value}`)
      });
      console.log(response.WFREQ);
      var washFreq = response.WFREQ;

    
    


      // BONUS: Build the Gauge Chart
      // buildGauge(data.WFREQ);

      // Trig to calc meter point
      var degrees = (9 - washFreq)*20,
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);

      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);

      var data = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 28, color:'850000'},
          showlegend: false,
          name: 'Frequency',
          text: washFreq,
          hoverinfo: 'text+name'
        },
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:["#081d58","#253494","#225ea8","#1d91c0",
        "#41b6c4","#7fcdbb","#c7e9b4","#edf8b1","#ffffd9",'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];

      var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
          }],
        title: {
          text: 'Belly Button Washing Frequency <br> Scrubs per Week',
          font: {
            family: 'Arial, bold',
            size: 18,
          }
        },
        // height: 450,
        // width: 450,
        xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };

      Plotly.newPlot('gauge', data, layout);

  });

}



function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var sample_url = `/samples/${sample}`;
  d3.json(sample_url).then(function(response) {
    // @TODO: Build a Bubble Chart using the sample data
    var trace_bubble = {
      x: response.otu_ids,
      y: response.sample_values,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: response.otu_ids,
        colorscale: "Earth",
        size: response.sample_values
      },
      text: response.otu_labels,
      hoverinfo: "x+y+text"
    };
    
    var data_bubble = [trace_bubble];
    
    var layout_bubble = {
      hovermode: "closest",
      showlegend: false,
      height: 500,
      width: 1000,
      xaxis: { title: "OTU ID"},
      yaxis: { title: "Sample Values"},
    };
    
    Plotly.newPlot('bubble', data_bubble, layout_bubble);

  
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var mergeData = response.otu_ids.map(function(e, i) {
      return {"otu_ids": e, "otu_labels": response.otu_labels[i], "sample_values": response.sample_values[i]};
    });
   
    mergeData.sort(function(a, b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    });
    var pieData = mergeData.slice(0, 10);
    var pieNames = pieData.map(entry => entry.otu_labels);
    // console.log(pieData);
    // console.log(pieNames);
    var trace_pie = {
      labels: pieData.map(entry => entry.otu_ids),
      values: pieData.map(entry => entry.sample_values),
      text: pieNames,
	    textinfo: 'percent',
      type: 'pie',
      hoverinfo: 'label+text+value+percent',
      
      };
    var data_pie = [trace_pie];

    var layout_pie = {
      // height: 450,
      // width: 450,
      showlegend: true,
      legend: {
        font: {
          family: 'sans-serif',
          size: 12,
          color: '#000'
        },
        textposition: 'auto',
      },
      hovermode: "closest",
      showlegend: true,
    };
    Plotly.newPlot('pie', data_pie, layout_pie);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    console.log(firstSample);
    // optionChanged(newSample)
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
