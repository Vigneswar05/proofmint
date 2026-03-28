// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertChain
 * @dev Secure certificate hashing and verification on blockchain
 */
contract CertChain {
    struct Certificate {
        bytes32 contentHash;
        string institution;
        uint256 timestamp;
        uint256 blockNumber;
        bool exists;
        bool isRevoked;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bool) public authorizedInstitutions;
    address public owner;

    struct Institution {
        string name;
        bytes32 passwordHash; // Stored securely on chain
        bool isRegistered;
        uint256 registeredAt;
        uint256 credits; // Prepaid wallet balance
    }

    // Map institution name to its on-chain record
    mapping(string => Institution) public registeredInstitutions;

    event CertificateIssued(bytes32 indexed hash, string institution, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed hash, uint256 timestamp);
    event InstitutionAuthorized(address indexed institution);
    event InstitutionRevoked(address indexed institution);
    event InstitutionRegistered(string name, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == owner || authorizedInstitutions[msg.sender], "Auth: caller is not authorized to issue");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeInstitution(address _institution) public onlyOwner {
        authorizedInstitutions[_institution] = true;
        emit InstitutionAuthorized(_institution);
    }

    function revokeInstitution(address _institution) public onlyOwner {
        authorizedInstitutions[_institution] = false;
        emit InstitutionRevoked(_institution);
    }

    /**
     * @dev Register an institution's login credentials on the blockchain
     */
    function registerInstitutionData(string memory _name, bytes32 _passwordHash) public onlyOwner {
        require(!registeredInstitutions[_name].isRegistered, "Institution already registered");

        registeredInstitutions[_name] = Institution({
            name: _name,
            passwordHash: _passwordHash,
            isRegistered: true,
            registeredAt: block.timestamp,
            credits: 0 // Starts empty, requires fiat top-up
        });

        emit InstitutionRegistered(_name, block.timestamp);
    }

    /**
     * @dev Removes an institution's access completely
     */
    function removeInstitution(string memory _name) public onlyOwner {
        require(registeredInstitutions[_name].isRegistered, "Institution not found");
        registeredInstitutions[_name].isRegistered = false;
        // Optionally revoke wallet authorization
    }

    /**
     * @dev Add prepaid credits after Fiat payment confirmation
     */
    function addCredits(string memory _name, uint256 _amount) public onlyOwner {
        require(registeredInstitutions[_name].isRegistered, "Institution not found");
        registeredInstitutions[_name].credits += _amount;
    }

    /**
     * @dev Verify if a given password hash matches the on-chain record
     */
    function verifyInstitutionLogin(string memory _name, bytes32 _passwordHash) public view returns (bool) {
        Institution memory inst = registeredInstitutions[_name];
        return inst.isRegistered && inst.passwordHash == _passwordHash;
    }

    function issueCertificate(bytes32 _hash, string memory _institution) public onlyAuthorized {
        require(!certificates[_hash].exists, "Certificate already registered");
        require(registeredInstitutions[_institution].credits >= 1, "Insufficient credits. Please recharge.");
        
        // Deduct 1 credit for this transaction
        registeredInstitutions[_institution].credits -= 1;
        
        certificates[_hash] = Certificate({
            contentHash: _hash,
            institution: _institution,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true,
            isRevoked: false
        });

        emit CertificateIssued(_hash, _institution, block.timestamp);
    }

    /**
     * @dev Revoke a previously issued certificate (flag as invalid)
     */
    function revokeCertificate(bytes32 _hash) public onlyAuthorized {
        require(certificates[_hash].exists, "Certificate not found");
        require(!certificates[_hash].isRevoked, "Already revoked");
        
        certificates[_hash].isRevoked = true;
        emit CertificateRevoked(_hash, block.timestamp);
    }

    /**
     * @dev Verify if a hash exists on the blockchain and is valid
     */
    function verifyCertificate(bytes32 _hash) public view returns (
        bool exists, 
        bool isRevoked,
        string memory institution, 
        uint256 timestamp, 
        uint256 blockNumber
    ) {
        Certificate memory cert = certificates[_hash];
        return (cert.exists, cert.isRevoked, cert.institution, cert.timestamp, cert.blockNumber);
    }
}
