/**
 * Steamer Pkg Default Config and Git Url
 * by heyli 2016.06.23
 */

module.exports = {
    'steamer-react': {
        git: 'https://github.com/SteamerTeam/steamer-react.git -b react',
        config: {
            src: "./react/",
            cmds: {
                dev: "npm run dev", 
                pub: "npm run pub",
            },
        },
    },
    'steamer-react-isomorphic': {
        git: 'https://github.com/SteamerTeam/steamer-react.git -b react-isomorphic',
        config: {
            src: "./react/",
            cmds: {
                dev: "npm run dev", 
                pub: "npm run pub",
            },
        },
    },
    'steamer-koa': {
        git: 'https://github.com/SteamerTeam/steamer-koa.git',
        config: {
            src: "./koa/",
            cmds: {
                dev: "npm start", 
                pub: "",
            },
        },
    },
    'steamer-gulp': {
        git: 'https://github.com/SteamerTeam/steamer-gulp.git',
        config: {
            src: "./normal/",
            cmds: {
                dev: "npm run dev", 
                pub: "npm run pub",
            },
        },
    }
};