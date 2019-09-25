var documenterSearchIndex = {"docs":
[{"location":"benchmarks/#","page":"-","title":"-","text":"[todo]","category":"page"},{"location":"usage/#Usage-1","page":"Usage","title":"Usage","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"The main object of interest supplied by this package is SDPAFamily.Optimizer{T}(). Here, T is a numeric type which defaults to BigFloat. Keyword arguments may also be passed to SDPAFamily.Optimizer():","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"variant: either :sdpa_gmp, :sdpa_qd, or :sdpa_dd, to use SDPA-GMP, SDPA-QD, or SDPA-DD, respectively. Defaults to :sdpa_gmp.\nsilent: a boolean to indicate whether or not to print output. Defaults to false.\nverbose: accepts either SDPAFamily.SILENT (which is equivalent to silent=true), SDPAFamily.WARN (which is the default), or SDPAFamily.VERBOSE, which prints all output from the binary as well as additional warnings.\npresolve: whether or not to run a presolve routine to remove linearly dependent constraints. See below for more details. Defaults to false. Note, presolve=true is required to pass many of the tests for this package; linearly independent constraints are an assumption of the SDPA-family, but constraints generated from high level modelling languages often do have linear dependence between them.\nbinary_path: a string representing a path to the SDPA-GMP binary to use. The default is chosen at build time. To change the default binaries, see Custom binary.\nparams: either SDPAFamily.DEFAULT (the default option), SDPAFamily.UNSTABLE_BUT_FAST, SDPAFamily.STABLE_BUT_SLOW, a NamedTuple giving a list of choices of parameters (e.g. params = (maxIteration=600,)), an SDPAFamily.Params object, or or a string representing a path to a custom parameter file. See SDPAFamily.Params for the possible choices of parameters.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"The default parameters used by SDPAFamily.jl depend on the variant and numeric type, and can be found as the default values in the source code here. The choices choices of parameters UNSTABLE_BUT_FAST and STABLE_BUT_SLOW are documented in the SDPA users manual, as well as the meaning of each parameter. A new parameter file is generated for each optimizer instance opt (and is regenerated for each solve), and can be found in the directory opt.tempdir, along with the SDPA-format input and output files for the problem, assuming a custom parameter file has not been passed to the optimizer. See Changing parameters & solving at very high precision below for an example.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"SDPAFamily.Optimizer() also accepts variant = :sdpa to use the non-high-precision SDPA binary. For general usage of the SDPA solver, use SDPA.jl which uses the C++ library to interface directly with the SDPA binary.","category":"page"},{"location":"usage/#Using-a-number-type-other-than-BigFloat-1","page":"Usage","title":"Using a number type other than BigFloat","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"SDPAFamily.Optimizer() uses BigFloat for problem data and solution by default. To use, for example, Float64 instead, simply call SDPAFamily.Optimizer{Float64}(). However, this may cause underflow errors when reading the solution file, particularly when MathOptInterface bridges are used. Note that with MathOptInterface all the problem data must be parametrised by the same number type, i.e. Float64 in this case.","category":"page"},{"location":"usage/#Using-presolve-1","page":"Usage","title":"Using presolve","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"SDPA-GMP will emit cholesky miss condition :: not positive definite error when the problem data contain linearly dependent constraints. Set presolve=true to use a presolve routine which tries to detect such constraints by Gaussian elimination. The redundant constraints are omitted from the problem formulation and the corresponding redundant decision variables are set to 0 in the final result. The time taken to perform the presolve step depends on the size of the problem. This process is numerically unstable, so is disabled by default. It does help quite a lot with some problems, however.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"using SDPAFamily, Test\nusing Pkg\nPkg.add(PackageSpec(name=\"Convex\", url=\"https://github.com/ericphanson/Convex.jl\", rev=\"MathOptInterface\"));\nusing Convex\nρ₁ = Complex{BigFloat}[1 0; 0 0]\nρ₂ = (1//2)*Complex{BigFloat}[1 -im; im 1]\nE₁ = ComplexVariable(2, 2);\nE₂ = ComplexVariable(2, 2);\nproblem = maximize( real((1//2)*tr(ρ₁*E₁) + (1//2)*tr(ρ₂*E₂)),\n                    [E₁ ⪰ 0, E₂ ⪰ 0, E₁ + E₂ == Diagonal(ones(2))];\n                    numeric_type = BigFloat );\nopt = SDPAFamily.Optimizer(presolve = true, variant = :sdpa_gmp, silent = true);","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"We demonstrate presolve using the problem defined in Optimal guessing probability for a pair of quantum states. When presolve is disabled, SDPA solvers will terminate prematurely due to linear dependence in the input constraints. Note, however, that this does not necessarily happen. Empirically, for our test cases, solvers' intolerance to redundant constraints increases from :sdpa to :sdpa_gmp.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"solve!(problem, SDPAFamily.Optimizer(presolve = false))","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"Applying presolve helps by removing 8 redundant constraints from the final input file.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"solve!(problem, SDPAFamily.Optimizer(presolve = true))\n@test problem.optval ≈ 1//2 + 1/(2*sqrt(big(2))) atol=1e-30","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"We see we have recovered the true answer to a tolerance of 10^-30.","category":"page"},{"location":"usage/#Changing-parameters-and-solving-at-very-high-precision-1","page":"Usage","title":"Changing parameters & solving at very high precision","text":"","category":"section"},{"location":"usage/#","page":"Usage","title":"Usage","text":"Continuing the above example, we can also increase the precision by changing the default parameters:","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"opt = SDPAFamily.Optimizer(\n    presolve = true,\n    params = (  epsilonStar = 1e-200, # constraint tolerance\n                epsilonDash = 1e-200, # normalized duality gap tolerance\n                precision = 2000 # arithmetric precision used in sdpa_gmp\n    ))\n\nsetprecision(2000) # set Julia's global BigFloat precision to 2000\nρ₁ = Complex{BigFloat}[1 0; 0 0]\nρ₂ = (1//2)*Complex{BigFloat}[1 -im; im 1]\nE₁ = ComplexVariable(2, 2);\nE₂ = ComplexVariable(2, 2);\nproblem = maximize( real((1//2)*tr(ρ₁*E₁) + (1//2)*tr(ρ₂*E₂)),\n                    [E₁ ⪰ 0, E₂ ⪰ 0, E₁ + E₂ == Diagonal(ones(2))];\n                    numeric_type = BigFloat );\nsolve!(problem, opt)\np_guess = 1//2 + 1/(2*sqrt(big(2)))\n@test problem.optval ≈ p_guess atol=1e-200","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"With these parameters, we have recovered the true answer to a tolerance of 10^-200.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"Note that we called setprecision(2000) at the start. This is so that the BigFloat objects used to construct ρ₁, ρ₂, the internals of the Convex.Problem instance are constructed to such a precision, as well as the BigFloat objects used to store the output of SDPA-GMP. The default, 256, is not sufficient in this case. Testing this can be a little bit subtle: for example, if setprecision(2000) was not called (or equivalently, setprecision(256) called instead), then the test","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"@test problem.optval ≈ p_guess atol=1e-200","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"would still pass. However, that is because p_guess is only constructed at approximately 77 digits of precision, and problem.optval is only read back from SDPA-GMP at the same precision. So in that case, the test isn't truly testing that the solution is accurate to 200 digits of precision.","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"In this case, since 1 and 1/2 are exactly representable by floating point numbers, it is enough to specify setprecision(2000) before the solve! call (so the ρ₁ and ρ₂ are only constructed at 256 bits of high precision), but it is good practice to set the precision at the start for the whole problem. Moreover, since the precision is mutable global state, it is best to set it once at the start of a session and not change it, or to setup and solve a problem within a single","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"setprecision(2000) do\n    ...\nend","category":"page"},{"location":"usage/#","page":"Usage","title":"Usage","text":"block, to avoid any potentially confusing behavior caused by mixing precisions.","category":"page"},{"location":"issues/#Possible-Issues-and-Troubleshooting-1","page":"Possible Issues & Troubleshooting","title":"Possible Issues and Troubleshooting","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"We now demonstrate some current limitations of this package via Convex.jl#MathOptInterface's Problem Depot. This is run with TEST=true, meaning the solution returned by the solver will be tested against the true solution.","category":"page"},{"location":"issues/#Underflows-1","page":"Possible Issues & Troubleshooting","title":"Underflows","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"This occurs when the precision used to represent the solution is not high enough compared to the internal precision used by the solver. This lack of precision can lead to catastrophic cancellation. In the following, SDPA-QD is used to solve the problem, and Float64 numbers are used to represent the obtained solution, and the test fails.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"using SDPAFamily, Test, SparseArrays\nusing Pkg\nPkg.add(PackageSpec(name=\"Convex\", url=\"https://github.com/ericphanson/Convex.jl\", rev=\"MathOptInterface\"));\nusing Convex","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"test_problem = Convex.ProblemDepot.PROBLEMS[\"affine\"][\"affine_Diagonal_atom\"];\nTEST = true; atol = 1e-3; rtol = 0.0;\ntest_problem(Val(TEST), atol, rtol, Float64) do problem\n    solve!(problem, SDPAFamily.Optimizer{Float64}(variant=:sdpa_qd, silent=true))\nend","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"We try to automatically detect underflows and warn against them; in this case, the warning is issued. Sometimes this can be avoided by choosing a better set of parameters. See Choice of parameters.","category":"page"},{"location":"issues/#Presolve-1","page":"Possible Issues & Troubleshooting","title":"Presolve","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"The usefulness of our presolve routine is demonstrated in Using presolve. However, our presolve subroutine simply uses naïve Gaussian elimination and has its limitations. At its core, the reduce! method takes in a sparse matrix where each row is a linearized constraint matrix and apply Gaussian elimination with pivoting to identify the linear independence. This process is not numerically stable, and we cannot guarantee that all linear dependent entries will be identified.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"This is demonstrated in the following example. We explicitly construct a matrix with linearly dependent rows. However, due to its numerical instability, we can only identify a subset of them.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"M = sprand(100, 20000, 0.03);\nλ = rand();\nM[1, :] = λ*M[3, :] + (1-λ)*M[7, :];\nrows = Set(rowvals(SDPAFamily.reduce!(M)[:, 1:end-1]));\nredundant = collect(setdiff!(Set(1:10), rows));\n@test length(redundant) >= 1","category":"page"},{"location":"issues/#Choice-of-parameters-1","page":"Possible Issues & Troubleshooting","title":"Choice of parameters","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"Unfortunately, we have not been able to successfully solve every problem that we have tried with one choice of parameters. We have chosen default parameter settings that we hope will work with a wide variety of problems. See Usage for details on switching to two other sets of parameters provided by the solvers.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"This is an example where a better choice of parameters can help.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"test_problem = Convex.ProblemDepot.PROBLEMS[\"lp\"][\"lp_dotsort_atom\"];\nTEST = true; atol = 1e-3; rtol = 0.0;\ntest_problem(Val(TEST), atol, rtol, Float64) do problem\n    solve!(problem, SDPAFamily.Optimizer{Float64}(variant=:sdpa_dd, silent=true))\nend","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"test_problem = Convex.ProblemDepot.PROBLEMS[\"lp\"][\"lp_dotsort_atom\"];\nTEST = true; atol = 1e-3; rtol = 0.0;\ntest_problem(Val(TEST), atol, rtol, Float64) do problem\n    solve!(problem, SDPAFamily.Optimizer{Float64}(variant=:sdpa_dd, silent=true, params = SDPAFamily.UNSTABLE_BUT_FAST))\nend","category":"page"},{"location":"issues/#Summary-of-problematic-problems-1","page":"Possible Issues & Troubleshooting","title":"Summary of problematic problems","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"Due to the above reasons, we have modified the default settings for the following tests from Convex.jl's `Problem Depot'.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"Solver Underflow Need to use params = SDPAFamily.UNSTABLE_BUT_FAST Presolve disabled due to long runtime\n:sdpa_dd affine_Partial_transpose affine_Partial_transpose lp_pos_atom lp_neg_atom sdp_matrix_frac_atom lp_dotsort_atom affine_Partial_transpose lp_min_atom lp_max_atom\n:sdpa_qd affine_Partial_transpose affine_Diagonal_atom affine_Partial_transpose affine_Diagonal_atom affine_Partial_transpose lp_min_atom lp_max_atom\n:sdpa_gmp affine_Partial_transpose affine_Partial_transpose affine_Partial_transpose lp_min_atom lp_max_atom","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"In addition, we have excluded lp_dotsort_atom and lp_pos_atom when testing :sdpa due to imprecise solutions using default parameters. We have also excluded all second-order cone problems when using BigFloat or Double64 numeric types, due to MathOptInterface.jl#876, as well as the sdp_lambda_max_atom problem due to GenericLinearAlgebra#47. Both these issues have been fixed on the master branches of the respective packages, so these exclusions will be removed once new versions are released.","category":"page"},{"location":"issues/#Troubleshooting-1","page":"Possible Issues & Troubleshooting","title":"Troubleshooting","text":"","category":"section"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"When the solvers fail to return a solution, we recommend trying out the following troubleshoot steps.","category":"page"},{"location":"issues/#","page":"Possible Issues & Troubleshooting","title":"Possible Issues & Troubleshooting","text":"Set silent=false and look for warnings and error messages. If necessary, check the output file. Its path is printed by the solver output and can also be retrieved via Optimizer.tempdir.\nSet presolve=true to remove redundant constraints. Typically, redundant constraints are indicated by a premature cholesky miss error as shown above.\nUse BigFloat (the default) or Double64 (from the DoubleFloats package) precision instead of Float64 (e.g. SDPAFamily.Optimizer{Double64}(...)). This will reduce the chance of having underflow errors when reading back the results.\nChange the parameters by passing choices of parameters, e.g.  SDPAFamily.Optimizer(params=(SDPAFamily.UNSTABLE_BUT_FAST)), or SDPAFamily.Optimizer(params=(epsilonDash=1e-40,)). It might be helpful to use a tighter choice of the epsilonDash and epsilonStar parameters. See Usage and Changing parameters & solving at very high precision for more options and examples.","category":"page"},{"location":"examples/#Examples-1","page":"Examples","title":"Examples","text":"","category":"section"},{"location":"examples/#","page":"Examples","title":"Examples","text":"# This setup block is not shown in the final output\n# Install the right branch of Convex\nusing Pkg\nPkg.add(PackageSpec(name=\"Convex\", url=\"https://github.com/ericphanson/Convex.jl\", rev=\"MathOptInterface\"));\nsetprecision(256)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Here is a simple optimization problem formulated with Convex.jl:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"using SDPAFamily, LinearAlgebra\nusing Convex # ] add https://github.com/ericphanson/Convex.jl#MathOptInterface\ny = Semidefinite(3)\np = maximize(lambdamin(y), tr(y) <= 5; numeric_type = BigFloat)\nsolve!(p, SDPAFamily.Optimizer(presolve=true))\np.optval","category":"page"},{"location":"examples/#Optimal-guessing-probability-for-a-pair-of-quantum-states-1","page":"Examples","title":"Optimal guessing probability for a pair of quantum states","text":"","category":"section"},{"location":"examples/#","page":"Examples","title":"Examples","text":"In physics, a state represents a possible configuration of a physical system. In quantum mechanical systems with finitely many degrees of freedom, states are represented by density matrices, which are dtimes d matrices with complex entries that are positive semi-definite and have trace equal to one. States can be measured; mathematically, a measurement with n possible outcomes is represented by a set of measurement operators E_j_j=1^n, where each E_j is a dtimes d matrix. For example, imagine an experiment in which a charged particle is released in a magnetic field such that it will hit either a detector on the left or a detector on the right. This corresponds to a measurement of the particle with two outcomes, and hence two measurement operators E_1 E_2, which to the left and right detector.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"In order for E_j_j=1^n to be a valid set of measurement operators, each E_j must be positive semi-definite, and the family E_j_j=1^n must have the property that sum_j=1^n E_j = I_d, the dtimes d identity matrix. If the state of the system is represented by rho, and a measurement with measurement operators E_j_j=1^n is performed, then outcome j is obtained with probability operatornametrrho E_j.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Consider the case where d=2 (i.e. the states are qubits), and the state of the system is either represented by rho_1 = beginpmatrix 1  0  0  0 endpmatrix or by rho_2 = frac12beginpmatrix 1  -i  i  1 endpmatrix, but we don't know which; let's say there is a referee who flipped a fair coin, and then prepared the system in either rho_1 or rho_2. We will perform a measurement of the system, and then use the outcome to make a guess about the state of the system.  What is the measurement that gives the highest probability of correctly determining which state the system is in, and what's the optimal probability?","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"We will perform a measurement with measurement operators E_1 and E_2. If we get outcome 1, we will guess the system is in state rho_1 and and if we obtain outcome 2, we guess the system is in state rho_2. Then the probability of guessing correctly is","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"p_textguess(E_1 E_2) = frac12operatornametr(rho_1  E_1) + frac12operatornametr(rho_2  E_2)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"since there is a 50% chance of the system being in state rho_1, in which case we guess correctly when we get outcome 1 (which occurs with probability operatornametr(rho_1 E_1)), and a 50% chance of the system being in state rho_2, in which case we guess correctly when we get outcome 2.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Our goal now is to choose the optimal measurement operators to have the the best chance of guessing correctly. That is, we aim to maximize the above expression over all choices of E_1 and E_2 such that E_1 E_2 is a valid set of measurement operators. This is a semidefinite program, which can be solved e.g. with SDPAFamily.jl In this simple example with only two states to discriminate between, the problem can be solved analytically, and the solution is related to the trace distance between the two states. This problem specifically is Example 3.2.1 of the edX Quantum Cryptography notes by Thomas Vidick. It can be seen that the optimal guessing probability is","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"p_textguess = frac12 + frac12 sqrt2","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Let us see to what accuracy we can recover that result using the SDPA solvers.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"using SDPAFamily, Printf\nusing Convex # ] add https://github.com/ericphanson/Convex.jl#MathOptInterface\n\nρ₁ = Complex{BigFloat}[1 0; 0 0]\nρ₂ = (1//2)*Complex{BigFloat}[1 -im; im 1]\nE₁ = ComplexVariable(2, 2)\nE₂ = ComplexVariable(2, 2)\nproblem = maximize( real((1//2)*tr(ρ₁*E₁) + (1//2)*tr(ρ₂*E₂)),\n                    [E₁ ⪰ 0, E₂ ⪰ 0, E₁ + E₂ == Diagonal(ones(2))];\n                    numeric_type = BigFloat );\np_guess = 1//2 + 1/(2*sqrt(big(2)))\nfor variant in (:sdpa, :sdpa_dd, :sdpa_qd, :sdpa_gmp)\n    solve!(problem, SDPAFamily.Optimizer(silent = true, presolve = true, variant = variant))\n    error = abs(problem.optval - p_guess)\n    print(\"$variant solved the problem with an absolute error of \")\n    @printf(\"%.2e.\\n\", error)\nend","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Here, we have solved the problem four times, once with each variant of the SDPA family of optimizers supported by this package. We can see that SDPA-GMP has solved the problem to an accuracy of sim 10^-31, far exceeding machine precision.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"As usual with semidefinite programs, we can recover a set of optimal measurements:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"evaluate(E₁)\nevaluate(E₂)","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"Note that this is an example where the presolve routine is essential to getting good results:","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"for variant in (:sdpa, :sdpa_dd, :sdpa_qd, :sdpa_gmp)\n    solve!(problem, SDPAFamily.Optimizer(silent = true, presolve = false, variant = variant))\n    error = abs(problem.optval - p_guess)\n    print(\"$variant solved the problem with an absolute error of \")\n    @printf(\"%.2e.\\n\", error)\nend","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"We can see that without the presolve routine, we have only recovered the true solution up to errors of size sim 10^-1 for :sdpa variant. All other variants have failed to produce a result due to redundant constraints and returned with default value 0.","category":"page"},{"location":"examples/#","page":"Examples","title":"Examples","text":"This problem is revisited at very high precision in Changing parameters & solving at very high precision.","category":"page"},{"location":"installation/#Installation-1","page":"Installation","title":"Installation","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"This package is registered in the General registry; to install, type ] in the Julia command prompt, then enter","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"pkg> add SDPAFamily","category":"page"},{"location":"installation/#Automatic-binary-installation-1","page":"Installation","title":"Automatic binary installation","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"If you are on MacOS or Linux, this package will attempt to automatically download the SDPA-GMP, SDPA-DD, and SDPA-QD binaries, built by SDPA_GMP_Builder.jl. The SDPA-GMP binary is patched from the official SDPA-GMP source to allow printing more digits, in order to recover high-precision output.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"SDPA-GMP does not compile on Windows. However, it can be used via the Windows Subsystem for Linux(WSL). If you have WSL installed, then SDPAFamily.jl will try to automatically detect this and use an appropriate binary, called via WSL. This binary can be found at the repo https://github.com/ericphanson/SDPA_GMP_Builder, and is built on WSL from the source code at https://github.com/ericphanson/sdpa-gmp. Windows support is experimental, however, and we could not get it to run on Travis. Any help in this regard would be appreciated.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"SDPA-{GMP, QD, DD} are each available under a GPLv2 license, which can be found here: https://github.com/ericphanson/SDPA_GMP_Builder/blob/master/deps/COPYING.","category":"page"},{"location":"installation/#Custom-binary-1","page":"Installation","title":"Custom binary","text":"","category":"section"},{"location":"installation/#","page":"Installation","title":"Installation","text":"If you would like to use a different binary, set the environmental variable JULIA_SDPA_GMP_PATH (similarly for JULIA_SDPA_QD_PATH or JULIA_SDPA_DD_PATH) to the folder containing the binary you would like to use, and then build the package. This can be done in Julia by, e.g.,","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"ENV[\"JULIA_SDPA_GMP_PATH\"] = \"/path/to/folder/\"\nimport Pkg\nPkg.build(\"SDPAFamily\")","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"and that will configure this package to use that binary by default. If your custom location is via WSL on Windows, then also set ENV[\"JULIA_SDPA_GMP_WSL\"] = \"TRUE\" (similarly for ENV[\"JULIA_SDPA_QD_WSL\"] or ENV[\"JULIA_SDPA_DD_WSL\"]) so that SDPAFamily.jl knows to adjust the paths to the right format. Note that the binary must be named sdpa_gmp, sdpa_qd and sdpa_dd.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"It is recommended to patch SDPA-{GMP, QD, DD} (as was done in https://github.com/ericphanson/sdpa-gmp) in order to allow printing more digits. To do this for SDPA-GMP, and similarly for -QD and -DD,","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"For source code downloaded from the official website (dated 20150320), modify the P_FORMAT string at line 23 in sdpa_struct.h so that the output has a precision no less than 200 bits (default) or precision specified by the parameter file. \nFor source code downloaded from its GitHub repository, specify the print format string in param.sdpa as described in the SDPA users manual.","category":"page"},{"location":"installation/#","page":"Installation","title":"Installation","text":"Other information about compiling SDPA solvers can be found here.","category":"page"},{"location":"reference/#Developer-reference-1","page":"Developer reference","title":"Developer reference","text":"","category":"section"},{"location":"reference/#High-level-picture-1","page":"Developer reference","title":"High level picture","text":"","category":"section"},{"location":"reference/#","page":"Developer reference","title":"Developer reference","text":"The high precision SDPA solvers do not provide a library interface, only binary access. So SDPAFamily.jl takes the problem inputs from a MathOptInterface Optimizer object and writes them to a file in a temporary folder (in the SDPA format) and calls the binary. The binary reads the input file, solves the problem, and writes an output file. SDPAFamily.jl then reads the output file and populates the MathOptInterface Optimizer object.","category":"page"},{"location":"reference/#Docstrings-1","page":"Developer reference","title":"Docstrings","text":"","category":"section"},{"location":"reference/#","page":"Developer reference","title":"Developer reference","text":"Modules = [SDPAFamily]\nOrder   = [:type, :constant, :function]","category":"page"},{"location":"reference/#SDPAFamily.presolve-Union{Tuple{Optimizer{T}}, Tuple{T}} where T","page":"Developer reference","title":"SDPAFamily.presolve","text":"presolve(optimizer::SDPAFamily.Optimizer{T}) where T\n\nIdentifies linearly dependent constraints in the problem. This is done by a naive Gaussian elimination.\n\nReturns a vector with the indices of redundant constraints, which should be removed from the formulation. The rest of the constraints form a maximal linearly independent subset of the original set of constraints.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.read_results!-Union{Tuple{T}, Tuple{Optimizer{T},String,Array{T,1} where T}} where T","page":"Developer reference","title":"SDPAFamily.read_results!","text":"read_results!(optimizer::Optimizer{T}, filepath::String, redundant_entries::Vector)\n\nPopulates optimizer with results in a SDPA-formatted output file specified by filepath. Redundant entries corresponding to linearly dependent constraints are set to 0.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.Params","page":"Developer reference","title":"SDPAFamily.Params","text":"struct Params{variant, T <: Number}\n\nAn object holding a list of parameters to be used by the solver, parametrized by the variant and numeric type. variant should be one of :sdpa_gmp, :sdpa_qd, :sdpa_dd or sdpa. The variant and numeric type are used to choose the default values for unspecified parameters; they are unused in the case that every parameter is specified.\n\nnote: Note\nIt is often simpler to simply pass non-default parameters directly to the optimizer as a NamedTuple; e.g. SDPAFamily.Optimizer(params = (maxIteration = 600,)).\n\nExample\n\njulia> using SDPAFamily\n\njulia> P = SDPAFamily.Params{:sdpa_gmp, BigFloat}(maxIteration = 600)\nSDPAFamily.Params{:sdpa_gmp,BigFloat}(600, 1.0e-30, 10000.0, 2.0, -100000.0, 100000.0, 0.1, 0.3, 0.9, 1.0e-30, 200, \"%+.Fe\", \"%+.Fe\", \"%+.Fe\", \"%+.Fe\")\n\njulia> SDPAFamily.Optimizer(params = P)\nSDPAFamily.Optimizer{BigFloat}\n\n\nList of parameters\n\nThe following is a brief summary of the parameters. See the SDPA manual for more details.\n\nmaxIteration: number of iterations allowed * epsilonStar: constraint\n\ntolerance * epsilonDash: normalized duality gap tolerance * lambdaStar: determines initial point; should have the same order of magnitude as the optimal solution * omegaStar: determines region in which SDPA searches for an optimal solution; must be at least 1.0. * lowerBound, (resp. upperBound): bound on the primal (resp. dual) optimal objective value; serves as a stopping criteria * betaStar: parameter controlling the search direction for feasible points * betaBar: parameter controlling the search direction for infeasible points * gammaStar: reduction factor for the primal and dual step lengths * precision: number of significant bits used for SDPA-GMP; if set to b bits, then (log(2)/log(10)) * b is approximately the number of decimal digits of precision. * xPrint, XPrint, YPrint, infPrint: printf format specification used for printing the results to send them from the solver binary to Julia.\n\n\n\n\n\n","category":"type"},{"location":"reference/#SDPAFamily.ParamsSetting","page":"Developer reference","title":"SDPAFamily.ParamsSetting","text":"Possible the parameter settings of an SDPAFamily.Optimizer. One can also pass a path to the params keyword argument to use a custom parameter file.\n\nOptions are DEFAULT, UNSTABLE_BUT_FAST, or STABLE_BUT_SLOW.\n\n\n\n\n\n","category":"type"},{"location":"reference/#SDPAFamily.Verbosity","page":"Developer reference","title":"SDPAFamily.Verbosity","text":"Possible verbosity levels of an SDPAFamily.Optimizer.\n\nOptions are SILENT, WARN, or VERBOSE.\n\n\n\n\n\n","category":"type"},{"location":"reference/#SDPAFamily.BB_PATHS","page":"Developer reference","title":"SDPAFamily.BB_PATHS","text":"BB_PATHS::Dict{Symbol,String}\n\nHolds the binary-builder-built paths to the executables for sdpa_gmp, sdpa_dd, and sdpa_qd.\n\n\n\n\n\n","category":"constant"},{"location":"reference/#SDPAFamily.WSLize_path-Tuple{Any}","page":"Developer reference","title":"SDPAFamily.WSLize_path","text":"WSLize_path(path::String) -> String\n\nThis function converts Windows paths for use via WSL.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.initializeSolve-Tuple{SDPAFamily.Optimizer}","page":"Developer reference","title":"SDPAFamily.initializeSolve","text":"initializeSolve(optimizer::Optimizer)\n\nWrites problem data into an SDPA-formatted file named input.dat-s. presolve.jl routine is applied as indicated by optimizer.presolve.\n\nReturns a vector of indices for redundant constraints, which are omitted from the input file.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.inputElement-Union{Tuple{T}, Tuple{Optimizer,Int64,Int64,Int64,Int64,T}} where T","page":"Developer reference","title":"SDPAFamily.inputElement","text":"inputElement(optimizer::Optimizer, constr_number::Int, blk::Int, i::Int, j::Int, value::T) where T\n\nStores the constraint data in optimizer.elemdata as a vector of tuples. Each tuple corresponds to one line in the SDPA-formatted input file.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.reduce!-Union{Tuple{SparseMatrixCSC{T,Ti} where Ti<:Integer}, Tuple{T}, Tuple{SparseMatrixCSC{T,Ti} where Ti<:Integer,Any}} where T","page":"Developer reference","title":"SDPAFamily.reduce!","text":"function reduce!(A::SparseMatrixCSC{T}, ɛ = T <: Union{Rational,Integer} ? 0 : eps(norm(A, Inf))) where T\n\nIdentifies linearly dependent constraints in the problem. The last column of input is constraint constants and they are included to check if the linearly dependent constraints are redundant or inconsistent. This is done by a naive Gaussian elimination.\n\nReturns a vector with the indices of redundant constraints, which should be removed from the formulation. The rest of the constraints form a maximal linearly independent subset of the original set of constraints.\n\n\n\n\n\n","category":"method"},{"location":"reference/#SDPAFamily.sdpa_gmp_binary_solve!-Tuple{SDPAFamily.Optimizer,String,String}","page":"Developer reference","title":"SDPAFamily.sdpa_gmp_binary_solve!","text":"sdpa_gmp_binary_solve!(m::Optimizer, full_input_path, full_output_path; redundant_entries)\n\nCalls the binary sdpa_gmp to solve SDPA-formatted problem specified in a .dat-s file at full_input_path. Results are written into the file at full_output_path. redundant_entries is a sorted vector listing indices of linearly dependent constraint which are already removed by presolve.jl. The corresponding decision variables are populated as zeros.\n\nThis function returns m with solutions already populated from results in the output file.\n\n\n\n\n\n","category":"method"},{"location":"#SDPAFamily-1","page":"Home","title":"SDPAFamily","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"This package provides an interface to using SDPA-GMP, SDPA-DD, and SDPA-QD in Julia (http://sdpa.sourceforge.net). Call SDPAFamily.Optimizer() to use this wrapper via MathOptInterface, which is an intermediate layer between low-level solvers (such as SDPA-GMP, SDPA-QD, and SDPA-DD) and high level modelling languages, such as JuMP.jl and Convex.jl.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"To use the usual (non high-precision) SDPA solver, see SDPA.jl.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"JuMP currently only supports Float64 numeric types, which means that problems can only be specified to 64-bits of precision, and results can only be recovered at that level of precision, when using JuMP. This is tracked in the issue JuMP#2025.","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Convex.jl does not yet officially support MathOptInterface; this issue is tracked at Convex.jl#262. However, there is a work-in-progress branch which can be added to your Julia environment via","category":"page"},{"location":"#","page":"Home","title":"Home","text":"] add https://github.com/ericphanson/Convex.jl#MathOptInterface","category":"page"},{"location":"#","page":"Home","title":"Home","text":"which can be used to solve problems with the solvers from this package.","category":"page"},{"location":"#Credits-1","page":"Home","title":"Credits","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"This package was developed by Jiazheng Zhu in the summer of 2019, under the supervision of Eric Hanson.","category":"page"}]
}
