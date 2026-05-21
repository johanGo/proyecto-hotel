from flask import Flask, render_template, request, redirect, session
import pymysql

app = Flask(__name__)

app.secret_key = "clave_super_secreta"


# conexión 
conexion = pymysql.connect( host="localhost", user="root", password="", database="hotel" )

@app.route('/')
def raiz():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():

    correo = request.form['correo']
    contrasena = request.form['contrasena']

    cursor = conexion.cursor()

    sql = "SELECT primerNombre, rol FROM usuarios WHERE correo=%s AND contrasena=%s"
    cursor.execute(sql, (correo, contrasena))

    resultado = cursor.fetchone()

    print(resultado)
   

    if resultado:

        usuario = resultado[0]
        rol = resultado[1]

        session['usuario']=usuario
        session['correo'] = correo
        session['rol'] = rol

        if rol == "admin":
            return redirect('/admin')

        elif rol == "cliente":
            return redirect('/cliente')

    else:
        return "Correo o contraseña incorrectos"
    
@app.route('/admin')
# def admin():
#     return render_template('admin.html')
def admin():

    # verificar sesión
    if 'correo' not in session:
        return redirect('/')

    # verificar rol
    if session['rol'] != 'admin':
        return redirect('/')

    return render_template(
        'admin.html',
        usuario=session['usuario']
    )

@app.route('/cliente')
def cliente():
    # verificar sesión
    if 'correo' not in session:
        return redirect('/')

    # verificar rol
    if session['rol'] != 'cliente':
        return redirect('/')

    return render_template(
        'cliente.html',
        usuario=session['usuario']
    )

@app.route('/logout')
def logout():

    # borrar sesión
    session.clear()

    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)