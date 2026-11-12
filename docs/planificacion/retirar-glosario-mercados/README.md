# Retirar Glosario y Mercados

Fecha: 2026-11-12. Rama: fix/agricorp-proforma-config.

Solicitud de Carlos y su equipo: retirar ambos módulos del proyecto. Se eliminan rutas, enlaces, tarjetas, código, estilos exclusivos, valores iniciales del quiz y su fila en Reportes. Se actualizan README, manual y arquitectura. Los enlaces antiguos muestran Inicio para evitar una pantalla vacía.

Las razones de mercado de Análisis (UPA, P/U y P/VL) permanecen: pertenecen al análisis de Agricorp y no al módulo educativo retirado. No se borran datos históricos del almacenamiento del navegador.

Validación: suite completa, lint y pruebas de navegación que verifican ausencia de accesos y recuperación de enlaces antiguos. Cambio incluido junto con la configuración de proforma por solicitud de Carlos; pendiente de integración a main.
