The source codes for the contract is at ../polypuls3-contract.
The source codes for the subgraph is at ../polypuls3-subgraph.

When updating functions on the frontend (this project), always consider the side effects on these two projects.
For the contract, make sure that the frontend's abi matches the contract when submitting transactions related with project creation, poll creation, and survey creation.
For data retrieval, make sure that the frontend calls the appropriate endpoints and query on subgraph.