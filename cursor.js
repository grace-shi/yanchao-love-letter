function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDec (min, max) {
  return (Math.random() * (max - min) + min).toFixed(4)
}

function getDirection2 () {
  const arr = [-1, 1]
  return arr[getRandom(0, 1)]
}

function rgbArray (str) {
  const res = str
    .substring(4, str.length - 1)
    .replace(/ /g, '')
    .split(',')
    .map(i => Number(i))

  return res
}

function avgColor (rgb) {
  const out = []

  for (const i of rgb) {
    const dif = 255 - i
    const r = 255 - Math.floor(Math.random() * (dif * 2))
    out.push(r)
  }

  return `rgb(${out[0]},${out[1]},${out[2]})`
}

class CloudHeart {
  constructor (size, img, x, y) {
    const spread = size * getRandomDec(0.2, 1.2)
    this.alpha = 0
    this.startSize = size
    this.size = size / 3
    this.baby = true
    this.img = img
    this.cx = getRandom(x - spread, x + spread)
    this.cy = getRandom(y - spread, y + spread)
    this.speed = getRandom(500, 1500)
    this.radius = getRandom(5, 30)
    this.direction = getDirection2()
    this.dead = false
    this.angle = 0
    this.birthday = performance.now()
  }

  animate (ts) {
    const elapsed = ts - this.birthday
    const inc = this.startSize / 500

    this.angle = Math.PI * (ts / this.speed)

    if (this.direction === 1) {
      this.x = this.cx + Math.cos(this.angle) * this.radius
      this.y = this.cy + Math.sin(this.angle) * this.radius
    } else {
      this.x = this.cx - Math.sin(this.angle) * this.radius
      this.y = this.cy - Math.cos(this.angle) * this.radius
    }

    this.alpha = (this.size / this.startSize)

    if (this.baby) {
      this.size = this.size + (elapsed * inc)
    } else {
      this.size = this.startSize - ((elapsed / 2.2) * inc)
    }

    if (this.size >= this.startSize) {
      this.baby = false
      this.birthday = ts
      this.startSize = this.size
    }

    if (this.size < 0) {
      this.dead = true
    }
  }
}

class GrowHeart {
  constructor (img, x, y, canvas) {
    this.size = 0
    this.x = x
    this.y = y
    this.img = img
    this.dead = false
    this.fadeout = false
    this.birthday = performance.now()
    this.w = canvas.width
    this.alpha = 0.6
  }

  fade () {
    this.fadeout = true
  }

  animate (ts) {
    const elapsed = ts - this.birthday

    this.size += elapsed / 10
    this.alpha -= elapsed / 50000

    if (this.alpha < 0) {
      this.dead = true
    }
  }
}

class HeartCloud {
  constructor (el, svg) {
    this.size = 20
    this.paint = false
    this.clicking = false
    this.heartArray = []
    this.color = 'rgb(255,83,93)'

    this.svg = svg

    this.canvas = el
    this.ctx = this.canvas.getContext('2d')

    this.canvasSize = this.canvasSize.bind(this)
    this.pushLogo = this.pushLogo.bind(this)

    this.bindEvents()
    this.canvasSize()
    this.animateCanvas()
  }

  canvasSize () {
    const style = window.getComputedStyle(this.canvas, null)
    const width = Number(style.getPropertyValue('width').slice(0, -2))
    const height = Number(style.getPropertyValue('height').slice(0, -2))

    this.canvas.width = width
    this.canvas.height = height
  }

  bindEvents () {
    window.addEventListener('resize', () => this.canvasSize())

    this.canvas.addEventListener('mousedown', () => { this.clicking = true })
    this.canvas.addEventListener('mouseup', () => {
      this.clicking = false
      this.killGrowHearts()
    })

    const down = ['mouseenter', 'touchstart']

    down.forEach(i => {
      this.canvas.addEventListener(i, (e) => {
        if (this.stopped) this.startCanvas()
        this.paint = true
        this.pushLogo(e)
        this.cycle = setInterval(() => this.pushLogo(e), 100)
      }, false)
    })

    const up = ['mouseleave', 'touchend']

    up.forEach(i => {
      this.canvas.addEventListener(i, (e) => {
        this.clearCycle()
        this.paint = false
      }, false)
    })

    const drag = ['mousemove', 'touchdrag']

    drag.forEach(i => {
      this.canvas.addEventListener(i, (e) => {
        this.clearCycle()
        if (this.paint) {
          this.pushLogo(e)
          this.cycle = setInterval(() => this.pushLogo(e), 100)
        }
      }, false)
    })
  }

  killGrowHearts () {
    for (const h of this.heartArray) {
      if (h.fade) {
        h.fade()
      }
    }
  }

  clearCycle () {
    clearInterval(this.cycle)
    this.cycle = null
  }

  pushLogo (e) {
    const cloudSize = Math.floor(getRandom(20, 100) / this.size)

    for (let i = 0; i < cloudSize; i++) {
      const rgb = rgbArray(this.color)
      const color = avgColor(rgb)

      if (this.clicking) {
        const GH = new GrowHeart(
          // getRandom(this.size - 20, this.size + 20),
          this.createImg(color),
          this.getMousePos(e).x,
          this.getMousePos(e).y,
          this.canvas
        )

        this.heartArray.push(GH)
      } else {
        const CH = new CloudHeart(
          getRandom(this.size - 20, this.size + 20),
          this.createImg(color),
          this.getMousePos(e).x,
          this.getMousePos(e).y
        )

        this.heartArray.push(CH)
      }
    }
  }

  createImg (color) {
    const svg = this.svg
    svg.querySelector('#inner').style.fill = color
    const xml = (new XMLSerializer()).serializeToString(svg)
    const img = new Image()
    img.src = `data:image/svg+xml;charset=utf-8,${xml}`
    return img
  }

  getMousePos (e) {
    const rect = this.canvas.getBoundingClientRect()

    const left = e.clientX ? e.clientX : e.targetTouches[0].clientX
    const top = e.clientY ? e.clientY : e.targetTouches[0].clientY

    return {
      x: left - rect.left,
      y: top - rect.top
    }
  }

  animateCanvas (ts) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.heartArray.length > 0) {
      for (const g of this.heartArray) {
        if (g.dead) {
          const i = this.heartArray.indexOf(g)
          this.heartArray.splice(i, 1)
        } else {
          const x = g.x - (g.size / 2)
          const y = g.y - (g.size / 2)

          this.ctx.globalAlpha = g.alpha
          this.ctx.drawImage(g.img, x, y, g.size, g.size)
          g.animate(ts)
        }
      }
    }

    requestAnimationFrame((ts) => this.animateCanvas(ts))
  }
}

const heart = document.querySelector('.heart-cursor')
const cursorCanvas = document.querySelector('#cursor')

new HeartCloud(cursorCanvas, heart)
