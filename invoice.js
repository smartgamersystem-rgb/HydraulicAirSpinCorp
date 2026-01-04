// --- SIGNATURE PAD ---
const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("touchstart", () => drawing = true);
canvas.addEventListener("touchend", () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener("touchmove", draw);

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const touch = e.touches[0];
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
}

// --- GENERAR FECHA Y HORA ACTUAL ---
function setInvoiceDateTime() {
  const now = new Date();
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', 
                    hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatted = now.toLocaleString('en-US', options);
  document.getElementById("invoice-datetime").textContent = formatted;
}

// Ejecutar al cargar la página
window.onload = setInvoiceDateTime;


function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Save signature as PNG
function saveSignature() {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "firma_cliente.png";
  link.click();
}

// --- CALCULATE TAXES AND TOTAL ---
function calculateTotal() {
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const tax = amount * 0.07; // 7% Florida tax
  const total = amount + tax;

  document.getElementById("tax").value = tax.toFixed(2);
  document.getElementById("total").value = total.toFixed(2);
}

// Automatic calculation when typing
document.getElementById("amount").addEventListener("input", calculateTotal);

// --- PAYMENT STATUS ---
function updatePaymentStatus() {
  const paymentType = document.getElementById("payment-type").value;
  const status = document.getElementById("payment-status");

  if(paymentType === "check") {
    status.innerHTML = "<strong>Payment Status:</strong> Pending (Check)";
  } else if(paymentType) {
    status.innerHTML = "<strong>Payment Status:</strong> Paid via " + capitalizeFirstLetter(paymentType);
  } else {
    status.innerHTML = "<strong>Payment Status:</strong> Pending";
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// --- GENERATE PDF SINGLE PAGE ADJUSTED ---
async function generatePDF() {
  const invoice = document.querySelector(".invoice-container");

  // Captura todo el invoice
  const canvas = await html2canvas(invoice, { scale: 3 }); // escala mayor para mejor resolución
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);

  // Ajuste proporcional para que quepa en una sola hoja
  const pdfWidth = pageWidth - 40; // margen 20 pt
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let position = 20; // margen superior

  // Si la imagen es más alta que la página, se escala proporcionalmente
  let finalHeight = pdfHeight;
  if(pdfHeight > pageHeight - 40) {
    finalHeight = pageHeight - 40;
  }

  pdf.addImage(imgData, "PNG", 20, position, pdfWidth, finalHeight);

  pdf.save("Invoice_HydraulicAirSpinCorp.pdf");
}
