{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    gcc
    python311
    python311Packages.virtualenv
    python311Packages.numpy
    python311Packages.pandas
    python311Packages.matplotlib
    python311Packages.seaborn
    python311Packages.scikit-learn
    python311Packages.tensorflow
  ];

  shellHook = ''
    export LD_LIBRARY_PATH=${pkgs.gcc.lib}/lib:$LD_LIBRARY_PATH
    echo "✅ LD_LIBRARY_PATH patched with libstdc++.so.6"
  '';
}
