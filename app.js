const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 

const FACEBOOK_APP_ID = 'IDENTIFICADOR_DE_LA_APP';
const FACEBOOK_APP_SECRET = 'CLAVE_SECRETA_DE_LA_APP';
const FACEBOOK_REDIRECT_URI = 'http://localhost:3000/auth/facebook/callback';

//Creo la ruta para redirigir a facebook para autenticación:
app.get('/auth/facebook', (req, res) => {
  const facebookAuthURL = `https://wwww.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${FACEBOOK_REDIRECT_URI}&scope=pages_show_list,ads_management,business_management,instagram_basic,instagram_content_publish,pages_read_engagement`;
  res.redirect(facebookAuthURL);
})

//Ruta de callback de Facebook:
app.get('/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  if(!code){
    return res.redirect('/');
  }
  try{
    //Intercambiamos el código por un token de acceso
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URI,
        code
      }
    });

    const { access_token } = tokenResponse.data;
    console.log('access_token', access_token);

    //obtener información del usuario:
    const userResponse = await axios.get(`https://graph.facebook.com/v19.0/${access_token}`, {
      params: {
        fields: 'id.name',
        access_token
      }
    })

    const user = userResponse.data;
    //guardamos la información del usuario en la sesión
    req.session.user = user;

    res.redirect('/');
  } catch (error){
    console.error('Error durante la autenticación con Facebook: ', error);
    res.redirect('/');
  }
});

// Ruta de logout:

//Ruta principal:


//Simulación del posteo en Instagram:
app.post('/postToInstagram', async (req, res) => {
    try {
      const { date, title, description, image } = req.body;
  
      // Aquí es donde normalmente harías la solicitud a la API de Instagram
      // pero vamos a simular la acción.
  
      // Simulamos una petición a Instagram
      const response = await axios.post('https://api.instagram.com/v1/media', {
        image_url: image,
        caption: `${title}\n\n${description}\n\nPublicación programada para: ${date}`
      }, {
        headers: {
          'Authorization': `Bearer YOUR_ACCESS_TOKEN`
        }
      });
  
      res.status(200).json({
        message: 'Post successfully created on Instagram',
        data: response.data
      });
    } catch (error) {
      console.error('Error posting to Instagram', error);
      res.status(500).json({
        message: 'Failed to post to Instagram',
        error: error.message
      });
    }
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
