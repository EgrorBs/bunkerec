var json_data = false;

window.onhashchange = () => reloadTable();

function setIframe(url) {
  document.getElementById('frame').src = url;
  console.log('New iframe URL: ', url);
}

function reloadTable() {
  if (!json_data)
    return;
  var vids = json_data['vids'];
  var linksStr;
  /*
    filter_rule,filter_rule,...
    |
    sort_rule,sort_rule,...
  */
  let rules = document.location.hash.substr(1).split('|');
  vids = vids.filter((vid) => {
    filter_rules = rules[0].split(',');
    for (var frule of filter_rules) {
      var [colN, rule] = frule.split('=');
      rule = decodeURI(rule);
      var val = false;
      console.log('colN', colN);
      console.log('vid', vid);
      switch (parseInt(colN)) {
        case 0: val = vid['#'];			break;
        case 1: val = vid.date;			break;
        case 2: val = vid.streamer;	break;
        case 3: val = vid.name;			break;
        default: return true;
      }
      val += '';
      if (!val.match(rule)) {
        console.log(val, '!=', rule);
        return false;
      }
      console.log(colN, rule);
    }
    return true;
  });
  /*
  vids.sort((a, b) => { // a - b
    return a['#'] - b['#'];
  })
  */

  document.getElementById('list').innerHTML = '';
  for (var idx in vids) {
    var vid = vids[idx];

    linksStr = '';
    for (var link of vid.links) {
        desc = '';
        if (link.desc) {
          desc = ` (${link.desc})`;
        }
        var target = 'blank';
        var href = link.href;
        if (link.iframe) {
          href = `javascript:setIframe('${link.href.replace("'", "\\'")}');`;
          target = '';
        }
        linksStr += `<td>[<a target="${target}" href="${href}">${link.service}${desc}</a>]</td>`;
    }
    var text = `<tr> <td>${vid['#']}</td> <td>${vid.date}</td> <td>${vid.streamer}</td> <td>"${vid.name}"</td> ${linksStr} </tr>`;
    document.getElementById('list').innerHTML += text;
  }
  console.log('table (re-)loaded');
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('./vids.json')
  .then((data) => data.json())
  .then((json) => {
    console.log('data - ', json);
    json_data = json;
    reloadTable();
  });
})
