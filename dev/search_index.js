var documenterSearchIndex = {"docs":
[{"location":"benchmarks/#","page":"Benchmarks","title":"Benchmarks","text":"[todo]","category":"page"},{"location":"usage/#Usage-1","page":"Usage","title":"Usage","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"The main object of interest supplied by this package is SDPAFamily.Optimizer{T}(). Here, T is a numeric type which defaults to BigFloat. Keyword arguments may also be passed to SDPAFamily.Optimizer:","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"variant: either :gmp, :qd, or :dd, to use SDPA-GMP, SDPA-QD, or SDPA-DD, respectively. Defaults to :gmp.\nsilent: a boolean to indicate whether or not to print output. Defaults to true.\npresolve: whether or not to run a presolve routine to remove linearly dependent constraints. See below for more details. Defaults to false. Note, presolve=true is required to pass many of the tests for this package; linearly independent constraints are an assumption of the SDPA-family, but constraints generated from high level modelling languages often do have linear dependence between them.\nbinary_path: a string representing a path to the SDPA-GMP binary to use. The default is chosen at build time.\nparams_path: a string representing a path to a parameter file named param.sdpa in the same folder as the binary if present. For details please refer to the SDPA users manual. The default parameters used by SDPAFamily.jl are here: https://github.com/ericphanson/SDPAFamily.jl/blob/master/deps/param.sdpa.","category":"page"},{"location":"usage/#Using-a-number-type-other-than-BigFloat-1","page":"Usage","title":"Using a number type other than BigFloat","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"SDPA-GMP.jl uses BigFloat for problem data and solution by default. To use, for example, Float64 instead, simply call SDPAFamily.Optimizer{Float64}(). However, this may cause underflow errors when reading the solution file, particularly when MathOptInterface bridges are used. Note that with MathOptInterface all the problem data must be parametrised by the same number type, i.e. Float64 in this case.","category":"page"},{"location":"usage/#Using-presolve-1","page":"Usage","title":"Using presolve","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"SDPA-GMP will emit cholesky miss condition :: not positive definite error if the problem data contain linearly dependent constraints. Set presolve=true, to use a presolver to try to detect such constraints by Gaussian elimination. The redundant constraints are omitted from the problem formulation and the corresponding decision variables are set to 0 in the final result. The time taken to perform the presolve step depends on the size of the problem. This process is numerically unstable, so is disabled by default. It does help quite a lot with some problems, however.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"using SDPAFamily\nusing Pkg\nPkg.add(PackageSpec(name=\"Convex\", url=\"https://github.com/ericphanson/Convex.jl\", rev=\"MathOptInterface\"));\nusing Convex\n\nE12, E21 = ComplexVariable(2, 2), ComplexVariable(2, 2)\ns1, s2 = [big\"0.25\" big\"-0.25\"*im; big\"0.25\"*im big\"0.25\"], [big\"0.5\" big\"0.0\"; big\"0.0\" big\"0.0\"]\np = Problem{BigFloat}(:minimize, real(tr(E12 * (s1 + 2 * s2) + E21 * (s2 + 2 * s1))), [E12 ⪰ 0, E21 ⪰ 0, E12 + E21 == Diagonal(ones(2)) ])\n\ntime = @elapsed solve!(p, SDPAFamily.Optimizer(silent = true, presolve = true, variant = :sdpa))\nerror = abs(p.optval - (6 - sqrt(big\"2.0\"))/4)\n@info \"SDPA solved the problem with an absolute error of \" error time\n\ntime = @elapsed solve!(p, SDPAFamily.Optimizer(silent = true, presolve = true, variant = :sdpa_dd))\nerror = abs(p.optval - (6 - sqrt(big\"2.0\"))/4)\n@info \"SDPA-dd solved the problem with an absolute error of \" error time\n\ntime = @elapsed solve!(p, SDPAFamily.Optimizer(silent = true, presolve = true, variant = :sdpa_qd))\nerror = abs(p.optval - (6 - sqrt(big\"2.0\"))/4)\n@info \"SDPA-qd solved the problem with an absolute error of \" error time\n\ntime = @elapsed solve!(p, SDPAFamily.Optimizer(silent = true, presolve = true, variant = :sdpa_gmp))\nerror = abs(p.optval - (6 - sqrt(big\"2.0\"))/4)\n@info \"SDPA-gmp solved the problem with an absolute error of \" error time","category":"page"},{"location":"problematicproblems/#Problematic-Problems-1","page":"Problematic problems & troubleshooting","title":"Problematic Problems","text":"","category":"section"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"Unfortunately, we have not been able to successfully solve every problem that we have tried with one choice of parameters. We have chosen default parameter settings that we hope will work with a wide variety of problems.","category":"page"},{"location":"problematicproblems/#Underflows-1","page":"Problematic problems & troubleshooting","title":"Underflows","text":"","category":"section"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"This occurs when the precision used to represent the solution is not high enough compared to the internal precision used by the solver. This lack of precision can lead to catastraphic cancellation. For example, the following problem is taken from the Convex.jl Problem Depot, and is run with TEST=true, meaning the solution returned by the solver will be tested against the true solution. In the following, SDPA-QD is used to solve the problem, and Float64 numbers are used to represent the obtained solution, and the test fails.","category":"page"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"using SDPAFamily\nusing Pkg\nPkg.add(PackageSpec(name=\"Convex\", url=\"https://github.com/ericphanson/Convex.jl\", rev=\"MathOptInterface\"));\nusing Convex\n\ntest_problem = Convex.ProblemDepot.PROBLEMS[\"affine\"][\"affine_Diagonal_atom\"]\nTEST = true; atol = 1e-3; rtol = 0.0\ntest_problem(Val(TEST), atol, rtol, Float64) do problem\n    solve!(problem, SDPAFamily.Optimizer{Float64}(variant=:sdpa_qd, silent=true))\nend","category":"page"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"We try to automatically detect underflows and warn against them; in this case, the warning is issued.","category":"page"},{"location":"problematicproblems/#Presolve-1","page":"Problematic problems & troubleshooting","title":"Presolve","text":"","category":"section"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"[todo: add example where presolve helps and an example where presolve backfires]","category":"page"},{"location":"problematicproblems/#Troubleshooting-1","page":"Problematic problems & troubleshooting","title":"Troubleshooting","text":"","category":"section"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"Try:","category":"page"},{"location":"problematicproblems/#","page":"Problematic problems & troubleshooting","title":"Problematic problems & troubleshooting","text":"Set silent=false and look for warnings and error messages\nSet presolve=true to remove redundant constraints\nUse BigFloat (the default) or Double64 (from the DoubleFloats package) precision instead of Float64 (e.g. SDPAFamily.Optimizer{Double64}(...))\nChange the parameters by passing a custom parameter file (i.e. SDPAFamily(params_path=...)).","category":"page"},{"location":"installation/#Installation-1","page":"Installation","title":"Installation","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"This package is not yet registered in the General registry. To install, type ] in the julia command prompt, then execute","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"pkg> add https://github.com/ericphanson/SDPAFamily.jl","category":"page"},{"location":"installation/#Automatic-binary-installation-1","page":"Installation","title":"Automatic binary installation","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"If you are on MacOS or Linux, this package will attempt to automatically download the SDPA-GMP, SDPA-DD, and SDPA-QD binaries, built by SDPA_GMP_Builder.jl. The SDPA-GMP binary is patched from the official SDPA-GMP source to allow printing more digits, in order to recover high-precision output.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"SDPA-GMP does not compile on Windows. However, it can be used via the Windows Subsystem for Linux(WSL). If you have WSL installed, then SDPAFamily.jl will try to automatically detect this and use an appropriate binary, called via WSL. This binary can be found at the repo https://github.com/ericphanson/SDPA_GMP_Builder, and is built on WSL from the source code at https://github.com/ericphanson/sdpa-gmp. Windows support is experimental, however, and we could not get it to run on Travis. Any help in this regard would be appreciated.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"SDPA-{GMP, QD, DD} are each available under a GPLv2 license, which can be found here: https://github.com/ericphanson/SDPA_GMP_Builder/blob/master/deps/COPYING.","category":"page"},{"location":"installation/#Custom-binary-1","page":"Installation","title":"Custom binary","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"If you would like to use a different binary, set the enviromental variable JULIA_SDPA_GMP_PATH (similarly for JULIA_SDPA_QD_PATH or JULIA_SDPA_DD_PATH) to the folder containing the binary you would like to use, and then build the package. This can be done in Julia by, e.g.,","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"ENV[\"JULIA_SDPA_GMP_PATH\"] = \"/path/to/folder/\"\nimport Pkg\nPkg.build(\"SDPAFamily\")","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"and that will configure this package to use that binary by default. If your custom location is via WSL on Windows, then also set ENV[\"JULIA_SDPA_GMP_WSL\"] = \"TRUE\" (similarly for ENV[\"JULIA_SDPA_QD_WSL\"] or ENV[\"JULIA_SDPA_DD_WSL\"]) so that SDPAFamily.jl knows to adjust the paths to the right format. Note that the binary must be named sdpa_gmp, sdpa_qd and sdpa_dd. ","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"It is recommended to patch SDPA-{GMP, QD, DD} (as was done in https://github.com/ericphanson/sdpa-gmp) in order to allow printing more digits. To do this for SDPA-GMP, and similarly for -QD and -DD,","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"For source code downloaded from the official website (dated 20150320), modify the P_FORMAT string at line 23 in sdpa_struct.h so that the output has a precision no less than 200 bits (default) or precision specified by the parameter file. \nFor source code downloaded from its GitHub repository, specify the print format string in param.sdpa as described in the SDPA users manual.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"Other information about compiling SDPA solvers can be found here. ","category":"page"},{"location":"reference/#Developer-reference-1","page":"Developer reference","title":"Developer reference","text":"","category":"section"},{"location":"reference/#","page":"Developer reference","title":"Developer reference","text":"Modules = [SDPAFamily]\nOrder   = [:type, :constant, :function]","category":"page"},{"location":"reference/#SDPAFamily.presolve-Union{Tuple{Optimizer{T}}, Tuple{T}} where T","page":"Developer reference","title":"SDPAFamily.presolve","text":"presolve(optimizer::SDPAFamily.Optimizer{T}) where T\n\nIdentifies linearly dependent constraints in the problem. This is done by a naive Gaussian elimination.\n\nReturns a vector with the indices of redundant constraints, which should be removed from the formulation. The rest of the constraints form a maximal linearly independent subset of the original set of constraints.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.read_results!-Union{Tuple{T}, Tuple{Optimizer{T},String,Array{T,1} where T}} where T","page":"Developer reference","title":"SDPAFamily.read_results!","text":"read_results!(optimizer::Optimizer{T}, filepath::String, redundant_entries::Vector)\n\nPopulates optimizer with results in a SDPA-formatted output file specified by filepath. Redundant entries corresponding to linearly dependent constraints are set to 0.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.BB_PATHS","page":"Developer reference","title":"SDPAFamily.BB_PATHS","text":"BB_PATHS::Dict{Symbol,String}\n\nHolds the binary-builder-built paths to the executables for sdpa_gmp, sdpa_dd, and sdpa_qd.\n\n\n\n\n\n","category":"constant"},{"location":"reference/#SDPAFamily.WSLize_path-Tuple{Any}","page":"Developer reference","title":"SDPAFamily.WSLize_path","text":"WSLize_path(path::String) -> String\n\nThis function converts Windows paths for use via WSL.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.initializeSolve-Tuple{SDPAFamily.Optimizer}","page":"Developer reference","title":"SDPAFamily.initializeSolve","text":"initializeSolve(optimizer::Optimizer)\n\nWrites problem data into an SDPA-formatted file named input.dat-s. presolve.jl routine is applied as indicated by optimizer.presolve.\n\nReturns a vector of indices for redundant constraints, which are omitted from the input file.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.inputElement-Union{Tuple{T}, Tuple{Optimizer,Int64,Int64,Int64,Int64,T}} where T","page":"Developer reference","title":"SDPAFamily.inputElement","text":"inputElement(optimizer::Optimizer, constr_number::Int, blk::Int, i::Int, j::Int, value::T) where T\n\nStores the constraint data in optimizer.elemdata as a vector of tuples. Each tuple corresponds to one line in the SDPA-formatted input file.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.reduce!-Union{Tuple{SparseMatrixCSC{T,Ti} where Ti<:Integer}, Tuple{T}, Tuple{SparseMatrixCSC{T,Ti} where Ti<:Integer,Any}} where T","page":"Developer reference","title":"SDPAFamily.reduce!","text":"function reduce!(A::SparseMatrixCSC{T}, ɛ = T <: Union{Rational,Integer} ? 0 : eps(norm(A, Inf))) where T\n\nIdentifies linearly dependent constraints in the problem. The last column of input is constraint constants and they are included to check if the linearly dependent constraints are redundant or inconsistent. This is done by a naive Gaussian elimination.\n\nReturns a vector with the indices of redundant constraints, which should be removed from the formulation. The rest of the constraints form a maximal linearly independent subset of the original set of constraints.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.sdpa_gmp_binary_solve!-Tuple{SDPAFamily.Optimizer,String,String}","page":"Developer reference","title":"SDPAFamily.sdpa_gmp_binary_solve!","text":"sdpa_gmp_binary_solve!(m::Optimizer, full_input_path, full_output_path; extra_args::Cmd, redundant_entries)\n\nCalls the binary sdpa_gmp to solve SDPA-formatted problem specified in a .dat-s file at full_input_path. Results are written into the file at full_output_path. extra_args is passed on to the binary as additional options, allowing for e.g. custom parameter files. redundant_entries is a sorted vector listing indices of linearly dependent constraint which are already removed by presolve.jl. The corresponding decision variables are populated as zeros.\n\nThis function returns m with solutions already populated from results in the output file.\n\n\n\n\n\n","category":"method"},{"location":"#SDPAFamily-1","page":"Home","title":"SDPAFamily","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"This package provides an interface to using SDPA-GMP, SDPA-DD, and SDPA-QD in Julia (http://sdpa.sourceforge.net). Call SDPAFamily.Optimizer() to use this wrapper via MathOptInterface, which is an intermediate layer between low-level solvers (such as SDPA-GMP, SDPA-QD, and SDPA-DD) and high level modelling languages, such as JuMP.jl and Convex.jl.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"JuMP currently only supports Float64 numeric types, which means that problems can only be specified to 64-bits of precision, and results can only be recovered at that level of precision, when using JuMP. This is tracked in the issue JuMP#2025.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Convex.jl does not yet officially support MathOptInterface; this issue is tracked at Convex.jl#262. However, there is a work-in-progress branch which can be added to your Julia environment via","category":"page"},{"location":"#","page":"Home","title":"Home","text":"] add https://github.com/ericphanson/Convex.jl#MathOptInterface","category":"page"},{"location":"#","page":"Home","title":"Home","text":"which can be used to solve problems with the solvers from this package.","category":"page"}]
}
