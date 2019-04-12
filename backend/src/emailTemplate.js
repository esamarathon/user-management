export default `<!DOCTYPE html>
<html lang="en" >

<head>
  <meta charset="UTF-8">
  <title>A Pen by  CBenni</title>
  <style type="text/css">
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    height: 100%;  
  }
  
  body {
    background: #151e33;
    background: linear-gradient(-38deg, #161e32 0, #2b395a 100%);
    width: 100%;
    padding: 0;
    height: 100%;
    font-family: Titillium, Helvetica, sans-serif;
  }
  #app {
    padding: 8px;
    position: relative;
    margin: auto;
    width: 50%;
    max-width: 800px;
    min-width: 350px;
    background-color: #ccccff;
  }
  
  #header {
    margin-bottom: 32px;
  }
  
  #logo {
    display: inline-block;
    vertical-align: top;
    margin-right: 16px;
  }
  
  h1 {
    font-size: 55px;
    display: inline-block;
  }
  
  #footer {
    margin-top: 64px;
    font-size: 9pt;
  }
  </style>

  
</head>

<body>

  <div id="app">
    <div id="header">
      <img src="https://esamarathon.com/static/img/logos/logo-borderless.svg" id="logo"></img>
      <h1>European<br>Speedrunner<br>Assembly</h1>
    </div>
    <div id="body">
      <h3>Hey {{user.connections.twitch.displayName}}!</h3>
      {{message}}
    </div>
    <div id="footer">
      This email was sent to {{email}} in order to give important notifications.
      To manage your notification preferences go to <a href="{{profileUrl}}">{{profileUrl}}</a>.
      To unsubscribe from all notifications, click <a href="{{unsubscribeUrl}}">here</a>.
    </div>
    
  </div>

</body>

</html>
`;
