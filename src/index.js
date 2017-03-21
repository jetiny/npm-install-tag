import program from 'commander'
import {resolve, dirname} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import {version} from '../package.json'
import {spawn} from 'child_process'

program
  .version(version)
  .option('-p, --path [path]', 'package.json path default pwd')
  .option('-o, --override [override]', 'override package.json with resolved version')
  .parse(process.argv)

function exitIfError(err){
  if (err) {
    console.error('Error:');
    console.error(err);
    process.exit(1);
  }
}

program.path = resolve(program.path || '.', 'package.json')
program.override = !!program.override

let fields = [
  'dependencies',
  'devDependencies'
]

try {
  let pkg = JSON.parse(readFileSync(program.path))
  let deps = {}
  let args = []
  fields.forEach((key) => {
    if (pkg[key]) {
      let list = pkg[key]
      for (let name in list) {
        let value = list[name]
        if (value && !~value.indexOf('.')) {
          deps[name] = {
            name: list
          }
          args.push(`${name}@${value}`)
        }
      }
    }
  })
  if (process.env.NIT_NPM) {
    args = process.env.NIT_NPM.split('').concat(args)
  }
  args.unshift('install')
  streamResults('npm', args, {cwd: dirname(program.path)}, function (err, text) {
    exitIfError(err)
    if (!program.override) {
      return
    }
    try {
      let re = /^(?:\+|`)--\s([\w-@.]+)/gm
      let mat
      while (mat = re.exec(text)) {
        let text = mat[1]
        let pos= text.lastIndexOf('@')
        let name = text.substr(0, pos)
        let value = text.substr(pos + 1, text.length)
        if (name in deps) {
          deps[name][name] = value
        }
      }
      writeFileSync(program.path, JSON.stringify(pkg, null, 2))
      console.log(`overwrite ${program.path}`)
    } catch (err) {
      exitIfError(err)
    }
  })
} catch (err) {
  exitIfError(err)
}

function streamResults(bin, args, opts, cb) {
  let output = ''
  let stderr = ''
  console.log('[npm-install-tag]', bin, args.join(' '))
  let child = spawn(bin, args, opts)
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', function (data) {
    output += data
    process.stdout.write(data)
  })
  child.stderr.on('data', function (data) {
    stderr += data
    process.stderr.write(data)
  })
  child.on('exit', function (code) {
    if (code !== 0) {
      return cb(new Error(stderr))
    }
    cb(null, output)
  })
}
