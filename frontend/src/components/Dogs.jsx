import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function Dogs() {
  const [dogs, setDogs] = useState([])
  const [litters, setLitters] = useState([])
  const [dogForm, setDogForm] = useState({ name: '', breed: '', gender: '', dob: '', status: 'on_farm' })
  const [litterForm, setLitterForm] = useState({ mother_id: '', father_id: '', date_of_birth: '', puppies_count: 0 })

  useEffect(() => {
    fetchDogs()
    fetchLitters()
  }, [])

  const fetchDogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dogs/dogs`)
      setDogs(res.data)
    } catch (error) {
      console.error('Error fetching dogs:', error)
    }
  }

  const fetchLitters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dogs/litters`)
      setLitters(res.data)
    } catch (error) {
      console.error('Error fetching litters:', error)
    }
  }

  const handleDogSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/dogs/dogs`, dogForm)
      setDogForm({ name: '', breed: '', gender: '', dob: '', status: 'on_farm' })
      fetchDogs()
    } catch (error) {
      console.error('Error adding dog:', error)
    }
  }

  const handleLitterSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/dogs/litters`, litterForm)
      setLitterForm({ mother_id: '', father_id: '', date_of_birth: '', puppies_count: 0 })
      fetchLitters()
    } catch (error) {
      console.error('Error adding litter:', error)
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Dogs Management</h1>
      
      <h2>Dogs</h2>
      <ul>
        {dogs.map(d => (
          <li key={d.id}>{d.name} - {d.breed} - {d.gender} - Status: {d.status}</li>
        ))}
      </ul>
      <form onSubmit={handleDogSubmit}>
        <input type="text" placeholder="Name" value={dogForm.name} onChange={e => setDogForm({...dogForm, name: e.target.value})} required />
        <input type="text" placeholder="Breed" value={dogForm.breed} onChange={e => setDogForm({...dogForm, breed: e.target.value})} />
        <select value={dogForm.gender} onChange={e => setDogForm({...dogForm, gender: e.target.value})}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="date" value={dogForm.dob} onChange={e => setDogForm({...dogForm, dob: e.target.value})} />
        <select value={dogForm.status} onChange={e => setDogForm({...dogForm, status: e.target.value})}>
          <option value="on_farm">On Farm</option>
          <option value="sold">Sold</option>
          <option value="deceased">Deceased</option>
        </select>
        <button type="submit">Add Dog</button>
      </form>

      <h2>Litters</h2>
      <ul>
        {litters.map(l => (
          <li key={l.id}>Mother {l.mother_id} - {l.date_of_birth} - Puppies: {l.puppies_count}</li>
        ))}
      </ul>
      <form onSubmit={handleLitterSubmit}>
        <input type="number" placeholder="Mother ID" value={litterForm.mother_id} onChange={e => setLitterForm({...litterForm, mother_id: parseInt(e.target.value)})} required />
        <input type="number" placeholder="Father ID" value={litterForm.father_id} onChange={e => setLitterForm({...litterForm, father_id: parseInt(e.target.value) || ''})} />
        <input type="date" value={litterForm.date_of_birth} onChange={e => setLitterForm({...litterForm, date_of_birth: e.target.value})} required />
        <input type="number" placeholder="Puppies Count" value={litterForm.puppies_count} onChange={e => setLitterForm({...litterForm, puppies_count: parseInt(e.target.value)})} required />
        <button type="submit">Add Litter</button>
      </form>
    </div>
  )
}