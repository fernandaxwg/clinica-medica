import React, { useState, useEffect } from 'react';

const datosIniciales = [
  { 
    id: 1, 
    dni: "0801-1998-01234", 
    nombre: "Carlos Mendoza", 
    fechaNacimiento: "1981-05-15",
    edad: 45, 
    telefono: "99887766", 
    email: "carlos@email.com",
    genero: "Masculino",
    contactoNombre: "Ana Mendoza",
    contactoTelefono: "99881122",
    tipoSangre: "O+",
    sintoma: "Fiebre persistente", 
    estado: "Pendiente",
    proximaCita: "2026-09-25 10:00 AM",
    fichaClinica: { presion: "120/80", temperatura: "38.5 °C", peso: "78 kg", alergias: "Penicilina", diagnostico: "Infección respiratoria", tratamiento: "Paracetamol 500mg" }
  },
  { 
    id: 2, 
    dni: "0801-2001-05678", 
    nombre: "María López", 
    fechaNacimiento: "2001-08-20",
    edad: 25, 
    telefono: "88776655", 
    email: "maria@email.com",
    genero: "Femenino",
    contactoNombre: "Pedro López",
    contactoTelefono: "88773344",
    tipoSangre: "A+",
    sintoma: "Chequeo de rutina", 
    estado: "Atendido",
    proximaCita: "Sin agendar",
    fichaClinica: { presion: "110/70", temperatura: "36.6 °C", peso: "62 kg", alergias: "Ninguna", diagnostico: "Chequeo normal", tratamiento: "Multivitamínico" }
  }
];

function App() {
  // AUTENTICACIÓN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // PACIENTES Y CITAS (Persistencia con localStorage)
  const [pacientes, setPacientes] = useState(() => {
    const pacientesGuardados = localStorage.getItem('clinica_pacientes');
    if (pacientesGuardados) {
      try {
        return JSON.parse(pacientesGuardados);
      } catch (e) {
        console.error("Error al leer pacientes de localStorage", e);
        return datosIniciales;
      }
    }
    return datosIniciales;
  });

  useEffect(() => {
    localStorage.setItem('clinica_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  // FORMULARIO PACIENTE
  const [form, setForm] = useState({ 
    dni: '', 
    nombre: '', 
    fechaNacimiento: '',
    edad: '', 
    telefono: '', 
    email: '', 
    genero: 'Masculino', 
    contactoNombre: '',
    contactoTelefono: '',
    tipoSangre: 'O+', 
    sintoma: '' 
  });

  const [editandoId, setEditandoId] = useState(null);

  // FILTROS
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // MODALES
  const [pacienteFicha, setPacienteFicha] = useState(null);
  const [fichaForm, setFichaForm] = useState({ presion: '', temperatura: '', peso: '', alergias: '', diagnostico: '', tratamiento: '' });

  const [pacienteCita, setPacienteCita] = useState(null);
  const [citaForm, setCitaForm] = useState({ fecha: '', hora: '', motivo: '' });

  // CALCULAR EDAD AUTOMÁTICAMENTE
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edadCalculada = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
      edadCalculada--;
    }
    return edadCalculada >= 0 ? edadCalculada : '';
  };

  const handleFechaNacimientoChange = (e) => {
    const fecha = e.target.value;
    const edadCalculada = calcularEdad(fecha);
    
    setForm({
      ...form,
      fechaNacimiento: fecha,
      edad: edadCalculada
    });
  };

  // HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario.trim() !== '' && password.trim() !== '') {
      setIsAuthenticated(true);
      setErrorLogin('');
    } else {
      setErrorLogin('Ingrese usuario y contraseña');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsuario('');
    setPassword('');
  };

  const guardarPaciente = (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.sintoma.trim()) {
      alert("El Nombre y el Motivo de Consulta son obligatorios.");
      return;
    }

    if (editandoId !== null) {
      setPacientes(pacientes.map(p => 
        p.id === editandoId ? { ...p, ...form, edad: Number(form.edad) || 0 } : p
      ));
      setEditandoId(null);
    } else {
      const nuevo = {
        id: Date.now(),
        ...form,
        edad: Number(form.edad) || 0,
        estado: "Pendiente",
        proximaCita: "Sin agendar",
        fichaClinica: { presion: '', temperatura: '', peso: '', alergias: '', diagnostico: '', tratamiento: '' }
      };
      setPacientes([nuevo, ...pacientes]);
    }

    setForm({ dni: '', nombre: '', fechaNacimiento: '', edad: '', telefono: '', email: '', genero: 'Masculino', contactoNombre: '', contactoTelefono: '', tipoSangre: 'O+', sintoma: '' });
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setForm({
      dni: p.dni || '',
      nombre: p.nombre || '',
      fechaNacimiento: p.fechaNacimiento || '',
      edad: p.edad || '',
      telefono: p.telefono || '',
      email: p.email || '',
      genero: p.genero || 'Masculino',
      contactoNombre: p.contactoNombre || '',
      contactoTelefono: p.contactoTelefono || '',
      tipoSangre: p.tipoSangre || 'O+',
      sintoma: p.sintoma || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm({ dni: '', nombre: '', fechaNacimiento: '', edad: '', telefono: '', email: '', genero: 'Masculino', contactoNombre: '', contactoTelefono: '', tipoSangre: 'O+', sintoma: '' });
  };

  const eliminarPaciente = (id, nombre) => {
    if (window.confirm(`¿Está seguro de que desea eliminar al paciente "${nombre}"?`)) {
      setPacientes(pacientes.filter(p => p.id !== id));
      if (editandoId === id) cancelarEdicion();
    }
  };

  const toggleEstado = (id) => {
    setPacientes(pacientes.map(p => 
      p.id === id ? { ...p, estado: p.estado === 'Pendiente' ? 'Atendido' : 'Pendiente' } : p
    ));
  };

  const abrirFicha = (p) => {
    setPacienteFicha(p);
    setFichaForm(p.fichaClinica || { presion: '', temperatura: '', peso: '', alergias: '', diagnostico: '', tratamiento: '' });
  };

  const guardarFicha = (e) => {
    e.preventDefault();
    setPacientes(pacientes.map(p => 
      p.id === pacienteFicha.id ? { ...p, estado: 'Atendido', fichaClinica: fichaForm } : p
    ));
    setPacienteFicha(null);
  };

  const abrirAgendarCita = (p) => {
    setPacienteCita(p);
    setCitaForm({ fecha: '', hora: '', motivo: p.sintoma || '' });
  };

  const guardarCita = (e) => {
    e.preventDefault();
    if (!citaForm.fecha || !citaForm.hora) {
      alert("Selecciona fecha y hora para la cita.");
      return;
    }
    const citaFormateada = `${citaForm.fecha} ${citaForm.hora}`;
    setPacientes(pacientes.map(p => 
      p.id === pacienteCita.id ? { ...p, proximaCita: citaFormateada } : p
    ));
    setPacienteCita(null);
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const texto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.dni.includes(busqueda);
    const estado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    return texto && estado;
  });

  const inputBasico = {
    padding: '8px',
    border: '1px solid #777',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '0.9rem',
    boxSizing: 'border-box'
  };

  // LOGIN
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100%', 
        backgroundColor: '#f0f2f5', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 0, 
        padding: '20px', 
        boxSizing: 'border-box', 
        fontFamily: 'sans-serif' 
      }}>
        <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '30px', width: '100%', maxWidth: '380px', border: '1px solid #ccc', boxSizing: 'border-box', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0033aa', marginTop: 0, textAlign: 'center' }}> Iniciar Sesión</h2>
          {errorLogin && <p style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center' }}>{errorLogin}</p>}
          <form onSubmit={handleLogin}> 
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Usuario:</label>
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="ingrese su nombre de usuario" style={{ ...inputBasico, width: '100%' }} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Contraseña:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ingrese su contraseña" style={{ ...inputBasico, width: '100%' }} />
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#0033aa', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PANEL PRINCIPAL
  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', margin: 0, padding: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* Barra Superior */}
      <div style={{ backgroundColor: '#0033aa', color: '#ffffff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff' }}> Clínica Médica </h2>
        <div>
          <span>Médico: <strong>{usuario}</strong> </span>
          <button onClick={handleLogout} style={{ backgroundColor: '#255994', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', marginLeft: '10px' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        
        <fieldset style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', color: editandoId !== null ? '#001da0' : '#0033aa' }}>
            {editandoId !== null ? ' Editar Paciente' : ' Registrar Nuevo Paciente'}
          </legend>
          
          <form onSubmit={guardarPaciente}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Nombre Completo *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required style={{ ...inputBasico, width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>DNI / Cédula</label>
                <input type="text" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} style={{ ...inputBasico, width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Fecha de Nacimiento</label>
                <input type="date" value={form.fechaNacimiento} onChange={handleFechaNacimientoChange} style={{ ...inputBasico, width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Edad </label>
                <input type="number" value={form.edad} readOnly style={{ ...inputBasico, width: '100%', backgroundColor: '#f0f0f0' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Teléfono</label>
                <input 
                  type="tel" 
                  value={form.telefono} 
                  onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })} 
                  style={{ ...inputBasico, width: '100%' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Correo Electrónico</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputBasico, width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Género</label>
                <select value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} style={{ ...inputBasico, width: '100%' }}>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Nom. contacto emergencia</label>
                <input type="text" value={form.contactoNombre} onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })} style={{ ...inputBasico, width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Tel. contacto emergencia</label>
                <input 
                  type="tel" 
                  value={form.contactoTelefono} 
                  onChange={(e) => setForm({ ...form, contactoTelefono: e.target.value.replace(/\D/g, '') })} 
                  style={{ ...inputBasico, width: '100%' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Grupo Sanguíneo</label>
                <select value={form.tipoSangre} onChange={(e) => setForm({ ...form, tipoSangre: e.target.value })} style={{ ...inputBasico, width: '100%' }}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.99rem', fontWeight: 'bold', color: '#0033aa', display: 'block', marginBottom: '4px' }}>
                Síntoma o Motivo de Consulta *
              </label>
              <input type="text" value={form.sintoma} onChange={(e) => setForm({ ...form, sintoma: e.target.value })} 
                 placeholder="Ej. Dolor de cabeza persistente" required 
                 style={{ ...inputBasico, width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ backgroundColor: editandoId !== null ? '#0020ad' : '#0033aa', color: '#ffffff', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editandoId !== null ? 'Actualizar Paciente' : 'Guardar Paciente'}
              </button>
              {editandoId !== null && (
                <button type="button" onClick={cancelarEdicion} style={{ backgroundColor: '#777777', color: '#ffffff', border: 'none', padding: '8px 16px', cursor: 'pointer' }}>
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </fieldset>

        <fieldset style={{ border: '1px solid #ccc', padding: '15px' }}>
          <legend style={{ fontWeight: 'bold', color: '#0033aa' }}> Pacientes Registrados</legend>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Buscar por Nombre o DNI..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              style={{ ...inputBasico, flex: 1, minWidth: '200px' }} 
            />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={inputBasico}>
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Atendido">Atendidos</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderColor: '#ccc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', color: '#0033aa' }}>
                  <th>DNI</th>
                  <th>NOMBRE</th>
                  <th>DATOS</th>
                  <th>SÍNTOMAS</th>
                  <th>PRÓXIMA CITA</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron pacientes.</td></tr>
                ) : (
                  pacientesFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>{p.dni || 'S/N'}</td>
                      <td><strong>{p.nombre}</strong></td>
                      <td>{p.edad ? `${p.edad} años` : 'S/E'} | {p.genero} | <strong>{p.tipoSangre}</strong></td>
                      <td>{p.sintoma}</td>
                      <td style={{ color: p.proximaCita !== 'Sin agendar' ? '#0033aa' : '#666', fontWeight: p.proximaCita !== 'Sin agendar' ? 'bold' : 'normal' }}>
                        {p.proximaCita}
                      </td>
                      <td>
                        <span style={{ color: p.estado === 'Atendido' ? 'green' : 'orange', fontWeight: 'bold' }}>
                          {p.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button onClick={() => toggleEstado(p.id)} style={{ backgroundColor: p.estado === 'Pendiente' ? '#279727' : '#cea800', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                            {p.estado === 'Pendiente' ? 'Atender' : 'A Pendiente'}
                          </button>
                          <button onClick={() => abrirAgendarCita(p)} style={{ backgroundColor: '#337ab7', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                             Cita
                          </button>
                          <button onClick={() => abrirFicha(p)} style={{ backgroundColor: '#0033aa', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                             Ficha
                          </button>
                          <button onClick={() => iniciarEdicion(p)} style={{ backgroundColor: '#3b80db', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                             Editar
                          </button>
                          <button onClick={() => eliminarPaciente(p.id, p.nombre)} style={{ backgroundColor: '#bb2c27', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                             Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </fieldset>

      </div>

      


      {pacienteCita && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', border: '2px solid #0033aa', padding: '20px', width: '320px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, color: '#0033aa' }}> Agendar Cita: {pacienteCita.nombre}</h3>
            <form onSubmit={guardarCita}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Fecha:</label>
                <input type="date" value={citaForm.fecha} onChange={(e) => setCitaForm({ ...citaForm, fecha: e.target.value })} style={{ ...inputBasico, width: '100%' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Hora:</label>
                <input type="time" value={citaForm.hora} onChange={(e) => setCitaForm({ ...citaForm, hora: e.target.value })} style={{ ...inputBasico, width: '100%' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.8rem', display: 'block' }}>Motivo:</label>
                <input type="text" value={citaForm.motivo} onChange={(e) => setCitaForm({ ...citaForm, motivo: e.target.value })} placeholder="Ej. Control médico" style={{ ...inputBasico, width: '100%' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setPacienteCita(null)} style={{ border: '1px solid #777', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#0033aa', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha */}
      {pacienteFicha && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', border: '2px solid #0033aa', padding: '20px', width: '450px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#0033aa' }}>Ficha Médica: {pacienteFicha.nombre}</h3>
            <p style={{ fontSize: '0.8rem', margin: '0 0 10px 0' }}>DNI: {pacienteFicha.dni} | Sangre: <strong>{pacienteFicha.tipoSangre}</strong></p>
            
            <form onSubmit={guardarFicha}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', display: 'block' }}>Presión:</label>
                  <input type="text" value={fichaForm.presion} onChange={(e) => setFichaForm({ ...fichaForm, presion: e.target.value })} placeholder="120/80" style={{ ...inputBasico, width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', display: 'block' }}>Peso:</label>
                  <input type="text" value={fichaForm.peso} onChange={(e) => setFichaForm({ ...fichaForm, peso: e.target.value })} placeholder="70 kg" style={{ ...inputBasico, width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', display: 'block' }}>Alergias:</label>
                  <input type="text" value={fichaForm.alergias} onChange={(e) => setFichaForm({ ...fichaForm, alergias: e.target.value })} placeholder="Ninguna" style={{ ...inputBasico, width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', display: 'block' }}>Diagnóstico:</label>
                <textarea rows="2" value={fichaForm.diagnostico} onChange={(e) => setFichaForm({ ...fichaForm, diagnostico: e.target.value })} style={{ ...inputBasico, width: '100%', fontFamily: 'inherit' }}></textarea>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '0.75rem', display: 'block' }}>Tratamiento / Receta:</label>
                <textarea rows="2" value={fichaForm.tratamiento} onChange={(e) => setFichaForm({ ...fichaForm, tratamiento: e.target.value })} style={{ ...inputBasico, width: '100%', fontFamily: 'inherit' }}></textarea>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => setPacienteFicha(null)} style={{ border: '1px solid #777', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Cerrar</button>
                <button type="submit" style={{ backgroundColor: '#0033aa', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Guardar Ficha</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;