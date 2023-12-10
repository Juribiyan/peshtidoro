


const Timer = {
	init: function() {
		this.runner = $('#runner-shadow')
		this.mascot = $('#peshtidor')
		this.mascot.addEventListener('click', () => {
			if (this._state == 'idle') {
				this.start()
			}
			else {
				this.stop()
			}
		})
		this.idleAnimation()
		this.originalTitle = document.title
		;['hour', 'minute', 'second'].forEach(hand => {
			this[hand+'Hand'] = $(`#${hand}-hand`)
		})
		this.setupNotifications()
		this.state = 'idle'
		// Start the perpetual clock
		const now = new Date()
		, timeLeftToFullSecond = 1000 - now.getMilliseconds()
		setTimeout(() => {
			this.tick()
			setInterval(() => this.tick(), 1000)
		}, timeLeftToFullSecond)
	},
	notificationsEnabled: false,
	setupNotifications: async function() {
		const supported = ("Notification" in window)
		if (!supported) {
			return
		}
		if (Notification.permission === "granted") {
			this.notificationsEnabled = true
		}
		else if (Notification.permission !== "denied") {
			const granted = await Notification.requestPermission()
			if (granted == "granted") {
				this.notificationsEnabled = true
			}
		}
	},
	// https://openjavascript.info/2023/01/20/show-desktop-notifications-with-javascript-in-the-browser/
	// https://pushpad.xyz/blog/web-notifications-difference-between-icon-image-badge
	notificationTemplates: {
		'work': {
			title: "За работу!"
		},
		'rest': {
			title: "Время отдохнуть!"
		}
	},
	notify: function(state) {
		if (!this.notificationsEnabled) return;
		const tpl = this.notificationTemplates[state]
		const notification = new Notification(tpl.title, {
		  // body: tpl.body,
		  // icon: tpl.icon
		})
	},
	start: async function() {
		// Set the work/rest boundaries
		this.workTime = 25
		this.restTime = 30 - this.workTime
		setRootVar('work-interval', this.workTime)

		this.startTime = new Date()
		this.initialDeg = time2deg(this.startTime, 'min')
		setRootVar('initial-angle', `${this.initialDeg}deg`)
		this.startTimeStamp = this.startTime.getTime()
		this.updateRunner(this.startTime)
		this.state = 'work'
	},
	tick: function() {
		const now = new Date()
		this.updateClock(now)
		if (this._state != 'idle') {
			this.updateRunner(now)
			const minutesPassed = (now.getTime() - this.startTimeStamp) / 1000 / 60
			this.state = ((minutesPassed % 30) >= this.workTime) ? 'rest' : 'work'
		}
		
	},
	stop: async function() {
		this.state = 'idle'
	},
	updateRunner: function(now) {
		let deg = time2deg(now, 'min')
		if (deg < this.initialDeg) {
			deg += 360
		}
		this.runner.style.setProperty('--runner-angle', `${deg}deg`)
	},
	updateClock: function(now) {
		this.hourHand	 .style.setProperty('rotate', `${time2deg(now, 'hour')}deg`)
		this.minuteHand.style.setProperty('rotate', `${time2deg(now, 'min' )}deg`)
		this.secondHand.style.setProperty('rotate', `${time2deg(now, 'sec' )}deg`)

		$('#dc-hour').innerText = now.getHours().toPadded(2)
		$('#dc-minute').innerText = now.getMinutes().toPadded(2)
		$('#dc-colon').classList.remove('dc-colon-fade')
		setTimeout(() => $('#dc-colon').classList.add('dc-colon-fade'), 1)
	},
	idleAnimation: async function() {
		this.idleAnimationTimeout = setTimeout(async () => {
			if (this._state != 'idle') return;
			this.mascot.style.setProperty('--roll-factor', -5)
			await sleep(100)
			this.mascot.style.setProperty('--roll-factor', 5)
			await sleep(150)
			this.mascot.style.setProperty('--roll-factor', 0)
			await sleep(100)

			this.idleAnimation()
		}, 1000 * (2 + Math.random()*5))
	},
	// _state: 'idle',
	titleIconMap: {
		'idle': '',
		'work': '🔴 ',
		'rest': '🟢 '
	},
	set state(state) {
		if (state == this._state) return;
		// Set the title icon
		document.title = this.titleIconMap[state] + this.originalTitle
		// Start/stop the idle animation
		if (state == 'idle') {
			this.idleAnimation()
		}
		else {
			// clearTimeout(this.idleAnimationTimeout)
			// Phase change notification
			if (this._state != 'idle') {
				this.notify(state)
			}
		}
		// Set the body class
		$('body').className = `${state}-state`

		this._state = state
	}

}

function generateClockMarks() {
	let html = ''
	for (let i = 0; i < 60; i++) {
		let extraClass = !(i % 15) ? 'fifteen-minute' : (!(i % 5) ? 'five-minute' : '')
		html += `<div class="mark ${extraClass}" style="--mark-n: ${i}"></div>`
	}
	$('#clock-dial')._ins('<*', html)
}

function time2deg(time, hand='sec') {
	if (hand == 'hour') {
		let hours = time.getHours()
		if (hours > 12) hours -= 12
		hours += time.getMinutes()/60 + time.getSeconds()/(60*60)
		return (hours / 12)*360
	}
	if (hand == 'min') {
		const minutes = time.getMinutes() + time.getSeconds()/60
		return (minutes / 60)*360
	}
	else {
		return (time.getSeconds() / 60)*360
	}
}

(function main() {
	generateClockMarks()
	Timer.init()
})()