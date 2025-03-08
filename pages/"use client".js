"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"

export default function MP3Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [equalizerBars, setEqualizerBars] = useState<number[]>(Array(16).fill(0))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number>()

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)

      // Create object URL for the selected file
      const objectUrl = URL.createObjectURL(file)
      setAudioSrc(objectUrl)

      // Reset player state
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)

    // Update equalizer bars based on current playback
    if (isPlaying) {
      const newBars = equalizerBars.map(() => Math.random() * 100)
      setEqualizerBars(newBars)
    }
  }

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return

    const seekTime = Number.parseFloat(e.target.value)
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Load metadata when audio source changes
  useEffect(() => {
    if (!audioRef.current) return

    const handleLoadedMetadata = () => {
      if (!audioRef.current) return
      setDuration(audioRef.current.duration)
    }

    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [audioSrc])

  // Clean up object URL when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (audioSrc && audioSrc.startsWith("blob:")) {
        URL.revokeObjectURL(audioSrc)
      }
    }
  }, [audioSrc])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 p-4">
      <div className="w-full max-w-2xl bg-blue-950 rounded-lg overflow-hidden border-4 border-blue-800 shadow-lg">
        {/* Display Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-700 p-3 flex justify-between items-center">
          <div className="text-amber-500 font-bold tracking-wider">PIONEER</div>
          <div className="text-green-400 text-sm">MP3 DIGITAL PLAYER</div>
          <div className="text-red-500 text-sm">SX-990</div>
        </div>

        {/* Main Display */}
        <div className="bg-blue-950 p-6 relative">
          {/* File Selection */}
          <div className="mb-4">
            <label className="block text-blue-300 text-sm mb-2">Seleccionar archivo MP3:</label>
            <input
              type="file"
              accept="audio/mp3,audio/mpeg"
              onChange={handleFileChange}
              className="block w-full text-sm text-blue-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-700 file:text-white
                hover:file:bg-blue-600"
            />
          </div>

          {/* Audio Element (hidden) */}
          <audio
            ref={audioRef}
            {...(audioSrc ? { src: audioSrc } : {})}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* LCD Display Background */}
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded border border-blue-700 p-4 mb-4">
            {/* Track Info */}
            <div className="text-center mb-4">
              <div className="font-mono text-green-500 text-lg truncate">
                {selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "No hay archivo seleccionado"}
              </div>
            </div>

            {/* Equalizer Display */}
            <div className="flex justify-between h-24 items-end mb-2">
              {equalizerBars.map((height, index) => (
                <div
                  key={index}
                  className="w-3 bg-gradient-to-t from-green-500 to-green-300"
                  style={{ height: `${isPlaying ? height : 0}%` }}
                />
              ))}
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-green-500 font-mono mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentTime / (duration || 1)) * 100}%, #1e40af ${(currentTime / (duration || 1)) * 100}%, #1e40af 100%)`,
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <button
                className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border-2 border-blue-600 flex items-center justify-center shadow-lg"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #1e40af ${(isMuted ? 0 : volume) * 100}%, #1e40af 100%)`,
                }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border-2 border-blue-600 flex items-center justify-center shadow-lg">
                <SkipBack className="h-5 w-5 text-white" />
              </button>

              <button
                className="w-14 h-14 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border-2 border-blue-600 flex items-center justify-center shadow-lg"
                onClick={togglePlay}
                disabled={!audioSrc}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
              </button>

              <button className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-700 to-blue-900 border-2 border-blue-600 flex items-center justify-center shadow-lg">
                <SkipForward className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className={`px-3 py-1 rounded ${isPlaying ? "bg-red-600" : "bg-blue-800"} text-white text-xs`}>
              {isPlaying ? "REPRODUCIENDO" : "DETENIDO"}
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-700 p-2 flex justify-between items-center">
          <div className="text-xs text-blue-300">DIGITAL SOUND PROCESSOR</div>
          <div className="text-xs text-amber-400">MP3 PLAYER</div>
        </div>
      </div>

      <div className="mt-6 text-blue-300 text-center">
        <p>Selecciona un archivo MP3 y presiona el botón de reproducción</p>
      </div>
    </div>
  )
}

