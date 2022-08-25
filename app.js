const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY ='F8_PLAYER'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const timer = $('.time-remain')
const currentVolume = $('.current-volume')
const audioVolumeBar = $('.volume-control')


const app = {
    currentIndex:0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [
        {
            name : 'Hai mươi hai',
            singer: 'Amee',
            path:'./music/song1.mp3',
            image:'./img/img2.png'
        },
        {
            name : 'Play Date',
            singer: 'Melanie Martinez',
            path:'./music/song2.mp3',
            image:'./img/img1.png'
        },
        {
            name : 'Attention',
            singer: 'Charlie Puth',
            path:'./music/song3.mp3',
            image:'./img/img3.png'
        },
        {
            name : ' Rockabye',
            singer: 'Clean Bandit(feat. Sean Paul & Anne-Marie)',
            path:'./music/song4.mp3',
            image:'./img/img4.png'
        },
        {
            name : 'Symphony',
            singer: 'Clean Bandit feat Zara Larsson',
            path:'./music/song5.mp3',
            image:'./img/img5.png'
        },
        {
            name : 'Sweet but Psycho',
            singer: 'Ava Max',
            path:'./music/song6.mp3',
            image:'./img/img6.png'
        },
        {
            name : 'Cheap Thrills',
            singer: 'Sia ft Sean Paul',
            path:'./music/song7.mp3',
            image:'./img/img7.png'
        },
        {
            name : 'Closer',
            singer: 'The Chainsmokers ft Halsey',
            path:'./music/song8.mp3',
            image:'./img/img8.png'
        }
        ],
    // 1. Render song
    setConfig: function (key,value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function (){
        const htmls =this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}  " data-index = "${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div> `
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperties: function (){
        Object.defineProperty(this,'currentSong',{
            get: function (){
                return this.songs[this.currentIndex]
            }
        })
    },
    // event lan chuot
    // 2. Scroll top
    handleEvents: function (){
        const _this = this
        const cdWidth = cd.offsetWidth
        document.onscroll = function (){
            const scrollTop = window.scrollY
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // khi click play
        playBtn.onclick = function (){
            if(_this.isPlaying){
                audio.pause()
            }else {
                audio.play()
            }
        }
        //khi play
        audio.onplay = function (){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // play => cd quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ],{
            duration: 5000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        // khi pause
        audio.onpause = function (){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        audioVolumeBar.oninput = function(e) {
            audio.volume = e.target.value / audioVolumeBar.max
            currentVolume.textContent = e.target.value
        }
        //seek - tiến độ thay đổi
        audio.ontimeupdate = function (){
            if(audio.duration){
                const progressPercent = (audio.currentTime / audio.duration ).toFixed(4) * 100
                const timeRemain = audio.duration - audio.currentTime
                let timeRemainAsMinute
                if (Math.floor(timeRemain % 60) < 10) {
                    timeRemainAsMinute = (timeRemain - (timeRemain % 60)) /60 + ':0' + Math.floor(timeRemain % 60)
                    timer.textContent = timeRemainAsMinute
                } else {
                    timeRemainAsMinute = (timeRemain - (timeRemain % 60)) /60 + ':' + Math.floor(timeRemain % 60)
                    timer.textContent = timeRemainAsMinute
                }
                progress.value = progressPercent
            }
        }

        // tua video
        progress.onchange = function (e){
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // khi click next
        nextBtn.onclick = function (){

            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToAcTiveSong()
        }
        // click prev
        prevBtn.onclick = function (){
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToAcTiveSong()
        }
        // click random
        randomBtn.onclick = function (e){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }
        // xử lí phát lại bài hát
        repeatBtn.onclick = function (e){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }
        // xử lí next song khi audio ended
        audio.onended = function (){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }
        // click vào playlist
        playList.onclick = function (e){
            const songNode = e.target.closest('.song:not(.active)')
            if(
                songNode || e.target.closest('.option')
            ){
                if(songNode){
                    _this.currentIndex = Number(songNode.getAttribute('data-index'))
                    //hoặc .dataset.index
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }

            }
        }
    },
    scrollToAcTiveSong: function (){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: "end",
                inline: "nearest"
                // block : "center"
            })
        },150)
    },
    loadCurrentSong:function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function (){
        //this.audioVolumeBar.value = '50'
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    //next song
    nextSong: function (){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length ){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    //random song
    randomSong:function (){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while (newIndex === this.currentIndex )
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    //pre song
    prevSong: function (){
        this.currentIndex--
        if(this.currentIndex < 0 ){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    start:function (){
        //gan cấu hình từ config vào ob
        this.loadConfig()
        currentVolume.textContent = `${audioVolumeBar.value}`
        audio.volume = audioVolumeBar.value / audioVolumeBar.max

        // audio.volume = Number(audioVolumeBar.value + '0.5' )
        // currentVolume.textContent = audio.volume * 100

        timer.textContent = '0:00'
        // dinh nghia thuoc tinh cho ob
        this.defineProperties()
        this.handleEvents()
        //Tai bai hat dau tien
        this.loadCurrentSong()
        this.render()
        // hiển thị trạng thái ban đầu của button
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}
app.start()