import logging
import sys

# Try to import js module to detect if we're in Pyodide
try:
    import js
    _has_js = True
except ImportError:
    _has_js = False


class GGLLogger:
    """
    Universal logger that routes to JavaScript console or Python logging

    Why? I tried to get the web app to capture stdout and stderr but couldn't
    make that work so this logger supports two use cases:

    1. If you're working on ggl without the web app, you get python logging
    2. If you're working in the web app, pyodide js.console.log goes into
       the browser console directly.
    """

    def __init__(self, name, level, use_js=None):
        self.name = name
        self.level = level
        # If use_js is explicitly set, use that; otherwise auto-detect
        self.use_js = use_js if use_js is not None else _has_js

        if not self.use_js:
            # Set up Python logger
            self.logger = logging.getLogger(f'ggl.{name}')
            if not self.logger.handlers:
                handler = logging.StreamHandler(sys.stdout)
                handler.setFormatter(logging.Formatter(
                    '%(name)s - %(levelname)s - %(message)s'))
                self.logger.addHandler(handler)
                self.logger.setLevel(self.level)

    def info(self, msg):
        if self.use_js:
            if self.level <= logging.INFO:
                js.console.log(f"[ggl.{self.name}] INFO: {msg}")
        else:
            self.logger.info(msg)

    def debug(self, msg):
        if self.use_js:
            if self.level <= logging.DEBUG:
                js.console.log(f"[ggl.{self.name}] DEBUG: {msg}")
        else:
            self.logger.debug(msg)

    def warning(self, msg):
        if self.use_js:
            if self.level <= logging.WARNING:
                js.console.warn(f"[ggl.{self.name}] WARNING: {msg}")
        else:
            self.logger.warning(msg)

    def error(self, msg):
        if self.use_js:
            if self.level <= logging.ERROR:
                js.console.error(f"[ggl.{self.name}] ERROR: {msg}")
        else:
            self.logger.error(msg)


# Global flag to control logging behavior for all loggers
_global_use_js = None


def set_global_js_logging(use_js):
    """Set global JavaScript logging preference"""
    global _global_use_js
    _global_use_js = use_js


def new_logger(name, level=logging.WARN):
    """Get a logger instance with the current global settings"""
    return GGLLogger(name, level, use_js=_global_use_js)
