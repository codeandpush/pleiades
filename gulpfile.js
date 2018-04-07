"use strict";
const gulp = require('gulp')
const _ = require('lodash')
const bz = require('bkendz')
const path = require('path')
const fs = require('fs')
const del = require('del')
const exec = require('child_process').execSync

const sequelizeBinPath = path.resolve(__dirname, './node_modules/.bin/sequelize')

gulp.task('sync:models:clean', () => bz.modelsSync({clean: true, seed: false, sequelizeBinPath}))
gulp.task('sync:models:seed', () => bz.modelsSync({clean: true, seed: true, sequelizeBinPath}))

gulp.task('db:migrate', bz.db.generateMigrations)
gulp.task('db:seed', () => {
    bz.db.init(true)
})

gulp.task('bz:local', () => {
    fs.writeFileSync('./package-lock.json', '{}')
    let pkg = require('./package.json')
    
    let depLocal = 'file:../bkendz'
    let dep = pkg.dependencies.bkendz
    pkg.dependencies.bkendz = dep === depLocal ? 'latest' : depLocal
    console.log(`Bkendz package set to '${pkg.dependencies.bkendz}'`)
    
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
    
    let prom = Promise.resolve()
    if (fs.existsSync('./node_modules')){
        prom = del(['./node_modules/**'])
    }
    
    return prom.then(() => {
        let cmd = 'npm install'
        return exec(cmd, {stdio: [0, 1, 2]})
    })
})