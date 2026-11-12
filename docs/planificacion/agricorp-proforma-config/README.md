# Balance proforma de AGRI-CORP

Fecha: 2026-11-12. Rama: fix/agricorp-proforma-config.

Se conserva D-113: apertura 2024, proyección 2025 y contraste real 2025. Los dos documentos aportados por Carlos coinciden con las bases del caso; no se sustituyen importes históricos ni se convierte la proyección publicada en US$ a C$.

Se habilita la edición del reparto existente de desembolsos en Planeación, se rechazan importes negativos, vacíos o no conciliados y se muestran los movimientos netos por cuenta en Proforma. No cambia la fórmula ni los supuestos del caso. Los pagos clasificados no se vuelven a sumar en caja.

Uso: Inicio → cargar AGRI-CORP consolidada → Proforma. Para modificar aplicaciones: Planeación → Supuestos → Aplicaciones para el balance proforma → Calcular y guardar. Se debe actualizar también el desembolso del periodo correspondiente. La carga del ejemplo reemplaza los módulos incluidos, por lo que no se ejecuta automáticamente sobre datos guardados.

Validación: pruebas del caso y del formulario (editar, guardar y recalcular), suite general y lint. Pendiente: revisión visual en navegador y publicación/integración mediante PR. No se cambió main.
