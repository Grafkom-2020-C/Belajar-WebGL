function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  var vertices = [];
  // Definisi posisi titik sudut pada kubus
  var cubePoints = [
    [-0.5,  0.5,  0.5],   // A, 0
    [-0.5, -0.5,  0.5],   // B, 1
    [ 0.5, -0.5,  0.5],   // C, 2 
    [ 0.5,  0.5,  0.5],   // D, 3
    [-0.5,  0.5, -0.5],   // E, 4
    [-0.5, -0.5, -0.5],   // F, 5
    [ 0.5, -0.5, -0.5],   // G, 6
    [ 0.5,  0.5, -0.5]    // H, 7 
  ];
  // Definisi warna titik sudut pada kubus
  var cubeColors = [
    [],
    [1.0, 0.0, 0.0],    // merah
    [0.0, 1.0, 0.0],    // hijau
    [0.0, 0.0, 1.0],    // biru
    [1.0, 1.0, 1.0],    // putih
    [1.0, 0.5, 0.0],    // oranye
    [1.0, 1.0, 0.0],    // kuning
    []
  ];
  // Definisi normal masing-masing titik sudut pada kubus
  var cubeNormals = [
    [],
    [0.0, 0.0, 1.0],    // depan
    [1.0, 0.0, 0.0],    // kanan
    [0.0, 1.0, 0.0],    // atas
    [-1.0, 0.0, 0.0],   // kiri
    [0.0, 0.0, -1.0],   // belakang
    [0.0, -1.0, 0.0],   // bawah
    []
  ];
  // Fungsi untuk membuat definisi vertices pada satu sisi kubus
  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      // Mendata posisi verteks
      var point = cubePoints[indices[i]];
      for (var j=0; j<point.length; j++) {
        vertices.push(point[j]);
      }
      // Mendata warna verteks
      var color = cubeColors[a];
      for (var j=0; j<color.length; j++) {
        vertices.push(color[j]);
      }
      // Mendata normal verteks
      var normal = cubeNormals[a];
      for (var j=0; j<normal.length; j++) {
        vertices.push(normal[j]);
      }
    }
  }
  quad(1, 2, 3, 0); // DEPAN
  quad(2, 6, 7, 3); // KANAN
  quad(3, 7, 4, 0); // ATAS
  quad(4, 5, 1, 0); // KIRI
  quad(5, 4, 7, 6); // BELAKANG
  quad(6, 2, 1, 5); // BAWAH

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Ibaratnya di bawah ini adalah .c
  var vertexShaderSource = `
    attribute vec3 a_Position;
    attribute vec3 a_Color;
    attribute vec3 a_Normal;
    varying vec3 v_Position;
    varying vec3 v_Color;
    varying vec3 v_Normal;
    uniform mat4 u_Projection;
    uniform mat4 u_View;
    uniform mat4 u_Model;
    void main() {
      gl_Position = u_Projection * u_View * u_Model * vec4(a_Position, 1.0);
      v_Position = (u_Model * vec4(a_Position, 1.0)).xyz;
      v_Color = a_Color;
      v_Normal = a_Normal;
    }
  `;
  var fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_Position;
    varying vec3 v_Color;
    varying vec3 v_Normal;
    uniform vec3 u_AmbientColor;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightPosition;
    uniform mat3 u_Normal;  // Matriks model untuk vektor-vektor normal
    void main() {
      // Mulai penghitungan pencahayaan dan pembayangan
      vec3 ambient = u_AmbientColor * v_Color;
      vec3 lightDirection = normalize(u_LightPosition - v_Position);
      vec3 normalDirection = normalize(u_Normal * v_Normal);
      float dotProductLN = max(dot(lightDirection, normalDirection), 0.0);
      vec3 diffuse = v_Color * u_LightColor * dotProductLN;    // koefisien serap material * intensitas cahaya datang * jumlah cahaya terpantulkan
      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `;

  // Ibaratnya di bawah ini adalah .o
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Ibarat mengetikkan teks source code ke dalam penampung .c
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.shaderSource(fragmentShader, fragmentShaderSource);

  // Ibarat mengompilasi .c menjadi .o
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  // Ibarat membuatkan penampung .exe
  var shaderProgram = gl.createProgram();

  // Ibarat memasukkan "adonan" .o ke dalam penampung .exe
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Ibarat menggabung-gabungkan "adonan" yang ada di dalam penampung .exe
  gl.linkProgram(shaderProgram);

  // Ibarat memulai menggunakan "cat" .exe ke dalam konteks grafika (penggambaran)
  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aPosition = gl.getAttribLocation(shaderProgram, "a_Position");
  var aColor = gl.getAttribLocation(shaderProgram, "a_Color");
  var aNormal = gl.getAttribLocation(shaderProgram, "a_Normal");
  gl.vertexAttribPointer(
    aPosition, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    0);
  gl.vertexAttribPointer(
    aColor, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    3 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(
    aNormal, 
    3, 
    gl.FLOAT, 
    false, 
    9 * Float32Array.BYTES_PER_ELEMENT, 
    6 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aColor);
  gl.enableVertexAttribArray(aNormal);

  gl.viewport(100, 0, canvas.height, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  var primitive = gl.TRIANGLES;
  var offset = 0;
  var nVertex = 36;

  var freeze = false;
  function onMouseClick(event) {
    freeze = !freeze;
  }
  document.addEventListener('click', onMouseClick);
  function onKeyDown(event) {
    if (event.keyCode == 32) freeze = true;
  }
  function onKeyUp (event) {
    if (event.keyCode == 32) freeze = false;
  }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  var model = glMatrix.mat4.create();
  var view = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(view,
    [0.0, 0.0, 2.0], // posisi kamera (titik)
    [0.0, 0.0, -2.0], // ke mana kamera menghadap (vektor)
    [0.0, 1.0, 0.0]  // ke mana arah atas kamera (vektor)
    );
  var projection = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projection,
    glMatrix.glMatrix.toRadian(90), // fovy
    1.0,  // rasio aspek
    0.5,  // near
    10.0  // far
    );
  var uModel = gl.getUniformLocation(shaderProgram, 'u_Model');
  var uView = gl.getUniformLocation(shaderProgram, 'u_View');
  var uProjection = gl.getUniformLocation(shaderProgram, 'u_Projection');
  gl.uniformMatrix4fv(uProjection, false, projection);
  gl.uniformMatrix4fv(uView, false, view);

  var uAmbientColor = gl.getUniformLocation(shaderProgram, 'u_AmbientColor');
  gl.uniform3fv(uAmbientColor, [0.6, 0.6, 0.6]);
  var uLightColor = gl.getUniformLocation(shaderProgram, 'u_LightColor');
  gl.uniform3fv(uLightColor, [1.0, 1.0, 1.0]);
  var uLightPosition = gl.getUniformLocation(shaderProgram, 'u_LightPosition');
  gl.uniform3fv(uLightPosition, [2.0, 3.0, 2.0]);
  var uNormal = gl.getUniformLocation(shaderProgram, 'u_Normal');

  // Memutar kubus secara euclidean menggunakan mouse
  var rotation = glMatrix.mat4.create();
  var dragging, lastx, lasty;
  function onMouseDown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    // Saat mouse diklik-kiri di area aktif browser,
    //  maka flag dragging akan diaktifkan
    if (
      rect.left <= x &&
      rect.right > x &&
      rect.top <= y &&
      rect.bottom > y
    ) {
      dragging = true;
      lastx = x;
      lasty = y;
    }
  }
  function onMouseUp(event) {
    // Ketika klik-kiri mouse dilipas
    dragging = false;
  }
  function onMouseMove(event) {
    if (dragging) {
      var x = event.clientX;
      var y = event.clientY;
      var xaxis = glMatrix.vec4.create();
      var yaxis = glMatrix.vec4.create();
      // Agar sumbu X dan Y di object coordinate dapat menyesuaikan diri
      //  dengan sumbu X dan Y di world coordinate ([1, 0, 0, 0] dan [0, 1, 0, 0]),
      //  maka mereka perlu ditransformasikan kembali
      //  dengan inversi dari rotasi yang dieksekusi sebelumnya
      var backRotation = glMatrix.mat4.create();
      glMatrix.mat4.invert(backRotation, rotation);
      glMatrix.vec4.transformMat4(xaxis, glMatrix.vec4.fromValues(1, 0, 0, 0), backRotation);
      glMatrix.vec4.transformMat4(yaxis, glMatrix.vec4.fromValues(0, 1, 0, 0), backRotation);
      // Asumsinya geser 1 piksel = putar 1/2 derajat
      var dx = (x - lastx) / 2;
      var dy = (y - lasty) / 2;
      var radx = glMatrix.glMatrix.toRadian(dy); // Rotasi terhadap sumbu x sebesar dy
      var rady = glMatrix.glMatrix.toRadian(dx); // Rotasi terhadap sumbu y sebesar dx
      // Menggunakan dx dan dy untuk memutar kubus
      glMatrix.mat4.rotate(rotation, rotation, radx, xaxis); // rotasi terhadap sumbu x
      glMatrix.mat4.rotate(rotation, rotation, rady, yaxis); // rotasi terhadap sumbu y
    }
    lastx = x;
    lasty = y;
  }
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);

  function render() {
    model = glMatrix.mat4.create(); // Matriks model kita reset ulang setiap kali render
    glMatrix.mat4.multiply(model, model, rotation);
    gl.uniformMatrix4fv(uModel, false, model);
    var normal = glMatrix.mat3.create();
    glMatrix.mat3.normalFromMat4(normal, model);
    gl.uniformMatrix3fv(uNormal, false, normal);
    gl.clearColor(0.0, 0.22, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitive, offset, nVertex);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
