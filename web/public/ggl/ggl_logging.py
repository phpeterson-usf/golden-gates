import logging
import sys

# Try to import js module to detect if we're in Pyodide
try:
    import js
    _has_js = True
except ImportError:
    _has_js = False

class GGLLogger:
    """Universal logger that routes to JavaScript console or Python logging"""
    def __init__(self, name, use_js=None):
        self.name = name
        # If use_js is explicitly set, use that; otherwise auto-detect
        self.use_js = use_js if use_js is not None else _has_js
        
        if not self.use_js:
            # Set up Python logger
            self.logger = logging.getLogger(f'ggl.{name}')
            if not self.logger.handlers:
                handler = logging.StreamHandler(sys.stdout)
                handler.setFormatter(logging.Formatter('%(name)s - %(levelname)s - %(message)s'))
                self.logger.addHandler(handler)
                self.logger.setLevel(logging.INFO)
    
    def info(self, msg):
        if self.use_js:
            js.console.log(f"[GGL.{self.name}] INFO: {msg}")
        else:
            self.logger.info(msg)
    
    def debug(self, msg):
        if self.use_js:
            js.console.log(f"[GGL.{self.name}] DEBUG: {msg}")
        else:
            self.logger.debug(msg)
    
    def warning(self, msg):
        if self.use_js:
            js.console.warn(f"[GGL.{self.name}] WARNING: {msg}")
        else:
            self.logger.warning(msg)
    
    def error(self, msg):
        if self.use_js:
            js.console.error(f"[GGL.{self.name}] ERROR: {msg}")
        else:
            self.logger.error(msg)

# Global flag to control logging behavior for all loggers
_global_use_js = None

def set_global_js_logging(use_js):
    """Set global JavaScript logging preference"""
    global _global_use_js
    _global_use_js = use_js

def get_logger(name):
    """Get a logger instance with the current global settings"""
    return GGLLogger(name, use_js=_global_use_js)