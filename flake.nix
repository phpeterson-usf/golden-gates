{
  description = "Golden Gates - Digital logic circuit simulation";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js for Vue.js frontend
            nodejs_22

            # Python for GGL simulation engine
            python312
            uv
          ];

          shellHook = ''
            echo "Golden Gates dev environment"
            echo "  Node.js: $(node --version)"
            echo "  Python:  $(python --version)"
            echo "  uv:      $(uv --version)"

		    # Auto-install npm deps if needed
		    if [ -f web/package.json ] && [ ! -d web/node_modules ]; then
		      echo "Installing npm dependencies..."
		      (cd web && npm install)
		    fi
          '';
        };
      }
    );
}
