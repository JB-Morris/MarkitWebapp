module.exports = {
     entry: {
        app: [
            './src/sidescroller-view.js',
            './src/firebase-auth.js',
            './src/navbar-login',
            './src/new-post.js',
            './src/find.js',
            './src/item.js',
            './src/profile.js',
            './src/hub.js',
            './src/firebase.js',
            './src/custom.js',
            './src/item-card.js',
            './src/signup.js'
        ]
     },
     output: {
         path: './bin',
         filename: 'index.bundle.js'
     }
 };
