$(function(){
    // Fess URL
    var baseUrl = "http://127.0.0.1:8080/api/v1/documents?q=";
    // JQuery object for search button
    var $searchButton = $('#searchButton');

    // Search processing function
    var doSearch = function(event){
      // Acquisition of display start position and display count
      var start = parseInt($('#searchStart').val()),
          num = parseInt($('#searchNum').val());
      // Checking the display start position
      if(start < 0) {
        start = 0;
      }
      if(num < 1 || num > 100) {
        num = 20;
      }
      // Acquisition of display page information
      switch(event.data.navi) {
        case -1:
          // For the previous page
          start -= num;
          break;
        case 1:
          // On the next page
          start += num;
          break;
        default:
        case 0:
          start = 0;
          break;
      }
      // Store search field value after trimming
      var searchQuery = $.trim($('#searchQuery').val());
      // Search form is empty
      if(searchQuery.length != 0) {
        var urlBuf = [];
        // Disable search button
        $searchButton.attr('disabled', true);
        // URL construction
        urlBuf.push(baseUrl, encodeURIComponent(searchQuery),
          '&start=', start, '&num=', num);
        // Send search request
        $.ajax({
          url: urlBuf.join(""),
          dataType: 'json',
        }).done(function(data) {

          var $subheader = $('#subheader'),
              $result = $('#result'),
              record_count = data.data.length,
              offset = 0,
              buf = [];
          if(record_count == 0) { // If there are no search results
            // Output to subheader area
            $subheader[0].innerHTML = "";
            // Output to result area
            buf.push("<h2><b>", data.q, "</b></h2>");
            buf.push("<p><b>No information was found matching </b>.</p>")
            $result[0].innerHTML = buf.join("");
          } else { // If the search hits
            var page_number = data.page_number,
                startRange = data.start_record_number,
                endRange = data.end_record_number,
                i = 0,
                max;
            offset = startRange - 1;
            // Output to subheader
            buf.push("Results <b>", startRange, "</b> - <b>", endRange,
                "</b> of <b>", record_count, "</b> for <b>", data.q,
                "</b> (", data.exec_time," sec)");
            $subheader[0].innerHTML = buf.join("");

            // Clear search result area
            $result.empty();

            // Search result output
            var $resultBody = $("<ol/>");
            var results = data.data;
            
            for(i = 0, max = results.length; i < max; i++) {
              buf = [];
              buf.push('<li><h3 class="title">', '<a href="', results[i].url_link.replaceAll(" ", "%20"), '">', results[i].title,
                '</a></h3><div class="body">', results[i].content_description,
                '<br/><cite>', results[i].site, '</cite></div></li>');
              $(buf.join("")).appendTo($resultBody);
            }
            $resultBody.appendTo($result);

            // Output page number information
            buf = [];
            buf.push('<div id="pageInfo">', page_number, 'page<br/>');
            if(data.prev_page) {
              // Link to the previous page
              buf.push('<a id="prevPageLink" href="#">&lt;&lt;previous page</a> ');
            }
            if(data.next_page) {
              // Link to next page
              buf.push('<a id="nextPageLink" href="#">next page&gt;&gt;</a>');
            }
            buf.push('</div>');
            $(buf.join("")).appendTo($result);
          }
          // Update page information
          $('#searchStart').val(offset);
          $('#searchNum').val(num);
          // Move page display to the top
          $(document).scrollTop(0);
        }).always(function() {
          // Enable search button
          $searchButton.attr('disabled', false);
        });
      }
      // Returns false because it does not submit
      return false;
    };

    // Processing when the Enter key is pressed in the search input field
    $('#searchForm').submit({navi:0}, doSearch);
    // Processing when the previous page link is clicked
    $('#result').on("click", "#prevPageLink", {navi:-1}, doSearch)
    // Processing when next page link is clicked
      .on("click", "#nextPageLink", {navi:1}, doSearch);
  });

  function openfile(url) {
    window.open(url, '_blank').focus();
  }