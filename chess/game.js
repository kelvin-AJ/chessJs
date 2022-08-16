
// *********BOARD********* //
/////////////////////////////////////////////
// Square

// ------global variables
const W = "w";
const B = "b";
const QS = "queen-side";
const KS = "king-side"; 
const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
const names = {
    "K" : "king",
    "Q" : "queen",
    "R" : "rook",
    "N" : "knight",
    "B" : "bishop",
    "p" : "pawn"
}
let checkForMate = false;


// ------DOM
const visualBoard = document.querySelector("#board");
const flipBtn = document.querySelector("#flip");
const body = document.querySelector("body");

class Square {
    #row;
    #column;

    constructor(column, row){
        this.#column = column;
        this.#row = row;
        this.isOccupied = false;
    }

    getNotation() {
        const rows = [1, 2, 3, 4, 5, 6, 7, 8];

        return `${columns[this.#column - 1]}${rows[this.#row - 1]}`
    }
    getSquareArr() {
        return [this.#row, this.#column]
    }
    equals(sqArr) {
        const [row, col] = sqArr;
        return (row == this.#row) && (col === this.#column)
    }
    setOccupant(piece){
        this.occupant = piece;
        this.isOccupied = true;
        return this;
    }
    getOccupant() {
        return this.occupant;
    }
    removeOccupant(){
        if(!this.occupant)console.log("occupant removed")
        this.occupant = undefined;
        this.isOccupied = false;
        return this;
    }
}

// Board main
class Board {
    #board = [];
    constructor(){
        this._fillBoard();
    }

    _fillBoard() {
        for(let i = 1; i <= 8; i++){
            for(let j = 1; j <= 8; j++){
                this.#board.push(new Square(i, j));
            }
        }
        return this;
    }

    getBoard(notation = false) {
        if(notation)return this.#board.map( square  => square.getNotation());
        return this.#board;
    }
    getSquarefromBoard(row, col){
        const sqr =  this.#board.find(square => {
           return square.equals([row, col])
        });
        return sqr;
    }
}

// INSTANTIATE GAME BOARD
const gameBoard = new Board();
// *********MOVES********* //
/////////////////////////////////////////////

let takenPiece;
class Move {
    #square;
    #piece;


    constructor(piece, square){
        this.#square = square;
        this.#piece = piece;
        this.notation = this.createNotation(piece, square);
    }
    createNotation(piece, square) {
        const pieceName  = piece.getType();
        const notation = `${pieceName == "p"? "" : pieceName}${square.getNotation()}`

        return notation;
    }

    getSquare(){
        return this.#square;
    }
    getPiece() {
        return this.#piece;
    }

    makeMove(test = false, start = false){
        // Standard stuff
       const sq =  (this.#square.setOccupant(this.#piece))
       if(!test)console.log(sq);
       takenPiece = sq.getOccupant();

        this.#piece.setFormerPosition(this.#piece.getPosition());
        this.#piece.setFormerMove(new Move(this.#piece, this.#piece.getFormerPosition()));


        // Business on Piece
        if(!start)this.#piece.getFormerPosition()?.removeOccupant();
        this.#piece.setPosition(this.#square);

        if(!this.#piece.getFormerPosition().equals(this.#square.getSquareArr())){
            if(!test)this.#piece.hasMoved = true;
        };
        return this;
    }

    undoMove(){
        this.getSquare().setOccupant(takenPiece);
        const formerMove = this.#piece.getFormerMove();
        formerMove.makeMove(true);
    }

    makeMoveUI() {
        const prevPosition = this.getPiece().getFormerPosition().getSquareArr();
        const curPosition = this.getPiece().getPosition().getSquareArr();

        const activeSqr = visualBoard.querySelectorAll(".active-square");
        activeSqr.forEach(s => s.classList.remove("active-square"))


        const domCurPosition = visualBoard.querySelector(`[data-id="[${curPosition}]"]`);
        const domPrevPosition = visualBoard.querySelector(`[data-id="[${prevPosition}]"]`)

        domCurPosition.innerHTML = "";
        domCurPosition.append(domPrevPosition.querySelector("img"));
        
    }
    equals(move) {
        return  this.notation == move.notation
    }
    getMove() {
        return this;
    }
}
// SPECIAL MOVES
class Castle extends Move {
    #rook;

    constructor(king, rook, square){
        super(king, square);
        this.#rook = rook;
        this.isCastle = true;
        this.notation == "O-O-O"
    }
    makeMove() {
        console.log("castle move")
        this.getPiece().setFormerPosition(this.getPiece().getPosition());
        this.getPiece().getFormerPosition().removeOccupant();
        if(!this.getPiece().getFormerPosition().equals(this.getSquare().getSquareArr())){
            this.getPiece().hasMoved = true;
        }

        // Business on square
        this.getPiece().setPosition(this.getSquare());
        this.getSquare().setOccupant(this.getPiece());
        

        let rookMove;
        if(this.#rook.side == KS){
            const [row, col] = this.getSquare().getSquareArr();
            rookMove = new Move(this.#rook, gameBoard.getSquarefromBoard(row, col - 1))
        }
        if(this.#rook.side == QS){
            const [row, col] = this.getSquare().getSquareArr();
            rookMove = new Move(this.#rook, gameBoard.getSquarefromBoard(row, col + 1))
        }
        rookMove.makeMove();
        rookMove.makeMoveUI();

        return this;
    }
}


// *********PIECES********* //
/////////////////////////////////////////////

class Piece {
    #color;
    #type;
    #position;
    #formerPosition;
    #formerMove;


    constructor(color, type){
        this.inboard = true;
        this.hasMoved = false;
        this.#type = type;
        this.#color = color;
    }
    possibleMoves(){}
    
    getInitMove() {
        const [row, col] = this.getPosition().getSquareArr();
        return new Move(this, gameBoard.getSquarefromBoard(row, col))
    }
    getColor(){
        return this.#color;
    }
    getType() {
        return this.#type;
    }
    getPosition(){
        return this.#position;
    }
    getFormerPosition() {
        return this.#formerPosition;
    }
    setPosition(square) {
        this.#position = square;
    }
    setId(id) {
        this.id = id;
    }
    setFormerPosition(square) {
        this.#formerPosition = square
    }
    getFormerPosition(){
        return this.#formerPosition;
    }
    setFormerMove(move) {
        this.#formerMove = move
    }
    getFormerMove(){
        return this.#formerMove;
    }
    

}

let x;
let y;

class King extends Piece {
    constructor(color) {
        super(color, "K");
        super.setPosition(this.provideDefaultPosition(color))
    }

    provideDefaultPosition(color) {
        if(color == W) {
            return gameBoard.getSquarefromBoard(1, 5);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(8, 5);
        }
    }

    getPossibleMoves() {
        return this._getNaturalMoves()
    }

    _getNaturalMoves() {
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        for(let i = row - 1; i <= row + 1; i++){
            for(let j = col -1; j <= col + 1; j++){
                if((i > 0) && (i <= 8) && (j > 0) && (j <= 8)){
                    if(!gameBoard.getSquarefromBoard(i , j).equals([row, col])){
                    const square = gameBoard.getSquarefromBoard(i , j);
                        if(!square.isOccupied){
                            naturalMoves.push(new Move(this, square))
                        }else if(square.occupant?.getColor() != this.getColor()){
                            naturalMoves.push(new Move(this, square));
                            continue
                        }else continue;
                    }
                }
            }
        }

        // CASTLING
        if(!checkForMate){

            if(row == 1 || row == 8){
                const sB = [
                    gameBoard.getSquarefromBoard(row, col + 1),
                    gameBoard.getSquarefromBoard(row, col + 2),
                    gameBoard.getSquarefromBoard(row, col + 3),
                    gameBoard.getSquarefromBoard(row, col - 1),
                    gameBoard.getSquarefromBoard(row, col - 2),
                    gameBoard.getSquarefromBoard(row, col - 3),
                    gameBoard.getSquarefromBoard(row, col - 4),
                ]

                if((!sB[0].isOccupied) && (!sB[1].isOccupied) && (!sB[2].occupant.hasMoved)){
                    console.log("castle move detected")
                    naturalMoves.push(new Castle(this, sB[2].occupant, sB[1]))
                }
                if((!sB[3].isOccupied) && (!sB[4].isOccupied) && (!sB[5].isOccupied) && (!sB[6].occupant.hasMoved)){
                    console.log("castle move detected")
                    naturalMoves.push(new Castle(this, sB[6].occupant, sB[4]))
                }
            
            }
        }
        return  naturalMoves;
    }
}

class Queen extends Piece {
    constructor(color) {
        super(color, "Q");
        super.setPosition(this.provideDefaultPosition(color))
    }

    provideDefaultPosition(color) {
        if(color == W) {
            return gameBoard.getSquarefromBoard(1, 4);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(8, 4);
        }
    }

    getPossibleMoves() {
        return this._getNaturalMoves()
    }
    _getNaturalMoves() {
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        // ROOK MOVES
        for(let i = row + 1; i < 9; i++){
            if(!gameBoard.getSquarefromBoard(i, col).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            }else if(gameBoard.getSquarefromBoard(i, col).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
                break;
            }else break;
        }
        for(let j = col + 1; j < 9; j++){
            if(!gameBoard.getSquarefromBoard(row, j).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            }else if(gameBoard.getSquarefromBoard(row, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
                break;
            }else break;
        }
        for(let i = row - 1; i > 0; i--){
            if(!gameBoard.getSquarefromBoard(i, col).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            }else if(gameBoard.getSquarefromBoard(i, col).occupant.getColor() != this.getColor()){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            break;
            }else break;
        }
        for(let j = col - 1; j > 0; j--){
            if(!gameBoard.getSquarefromBoard(row, j).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            }else if(gameBoard.getSquarefromBoard(row, j).occupant.getColor() != this.getColor()){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            break;
            }else break;
        }
        // BISHOP MOVES
        for(let [i,j] = [row + 1, col + 1]; (i < 9) && (j < 9); i++ && j++){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row + 1, col - 1]; (i < 9) && (j > 0); i++ && j--){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row - 1, col + 1]; (i > 0) && (j < 9); i-- && j++){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row - 1, col - 1]; (i > 0) && (j > 0); i-- && j--){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        return naturalMoves;
    }
}

class Rook extends Piece {
    constructor(color, side) {
        super(color, "R");
        this.side = side;
        super.setPosition(this.provideDefaultPosition(color, side))
    }

    provideDefaultPosition(color, side) {
        if(color == W) {
            return gameBoard.getSquarefromBoard(1, side == KS ? 8: 1);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(8, side == KS ? 8: 1);
        }
    }

    getPossibleMoves() {
        return this._getNaturalMoves()
    }

    _getNaturalMoves() {
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        for(let i = row + 1; i < 9; i++){
            if(!gameBoard.getSquarefromBoard(i, col).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            }else if(gameBoard.getSquarefromBoard(i, col).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
                break;
            }else break;
        }
        for(let j = col + 1; j < 9; j++){
            if(!gameBoard.getSquarefromBoard(row, j).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            }else if(gameBoard.getSquarefromBoard(row, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
                break;
            }else break;
        }
        for(let i = row - 1; i > 0; i--){
            if(!gameBoard.getSquarefromBoard(i, col).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            }else if(gameBoard.getSquarefromBoard(i, col).occupant.getColor() != this.getColor()){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, col)));
            break;
            }else break;
        }
        for(let j = col - 1; j > 0; j--){
            if(!gameBoard.getSquarefromBoard(row, j).isOccupied){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            }else if(gameBoard.getSquarefromBoard(row, j).occupant.getColor() != this.getColor()){
            naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row, j)));
            break;
            }else break;
        }
        return naturalMoves;
    }
}

class Knight extends Piece {
    constructor(color, side) {
        super(color, "N");
        this.side = side;
        super.setPosition(this.provideDefaultPosition(color, side))
    }

    provideDefaultPosition(color, side) {
        if(color == W) {
            return gameBoard.getSquarefromBoard(1, side == KS ? 7: 2);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(8, side == KS ? 7: 2);
        }
    }

    getPossibleMoves() {
        const naturalMoves =  this._getNaturalMoves();
        const possibleMoves = [];
        naturalMoves.forEach(move => {
            if(move.getSquare().occupant?.getColor() != this.getColor()){
                possibleMoves.push(move)
            }
        }) 
        return possibleMoves;
    }
    _getNaturalMoves() {
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        for(let i = col - 1; i <= col + 1; i += 2){
            if((row - 2 > 0) && (i > 0) && (i < 9)){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row - 2, i)))
            }
            if((row + 2 < 9) && (i > 0) && (i < 9)){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row + 2, i)))
            }
        }
        for(let j = row - 1; j <= row + 1; j += 2){
            if((col - 2 > 0) && (j > 0) && (j < 9)){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(j, col - 2)))
            }
            if((col + 2 < 9) && (j > 0) && (j < 9)){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(j, col + 2)))
            }
        }
        
        return naturalMoves;
    }
}
class Bishop extends Piece {
    constructor(color, side) {
        super(color, "B");
        this.side = side;
        super.setPosition(this.provideDefaultPosition(color, side))
    }

    provideDefaultPosition(color, side) {
        if(color == W) {
            return gameBoard.getSquarefromBoard(1 ,side == KS ? 6: 3);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(8, side == KS ? 6: 3);
        }
    }

    getPossibleMoves() {
        return this._getNaturalMoves()
    }
    _getNaturalMoves() {
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        for(let [i,j] = [row + 1, col + 1]; (i < 9) && (j < 9); i++ && j++){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row + 1, col - 1]; (i < 9) && (j > 0); i++ && j--){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row - 1, col + 1]; (i > 0) && (j < 9); i-- && j++){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        for(let [i,j] = [row - 1, col - 1]; (i > 0) && (j > 0); i-- && j--){
            if(!gameBoard.getSquarefromBoard(i, j).isOccupied){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
            }else if(gameBoard.getSquarefromBoard(i, j).occupant.getColor() != this.getColor()){
                naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(i, j)));
                break;
            }else break;
        }
        return naturalMoves;
    }
}
class Pawn extends Piece {
    constructor(color, column){
        super(color, "p");
        super.setPosition(this.provideDefaultPosition(color, column))
    }

    provideDefaultPosition(color, column) {

        if(color == W) {
            return gameBoard.getSquarefromBoard(2, column);
        }
        if(color == B) {
            return gameBoard.getSquarefromBoard(7, column);
        }
    }

    getPossibleMoves() {
        return this._getNaturalMoves()
    }
    _getNaturalMoves() {
        
        const [row, col] = this.getPosition().getSquareArr();
        const naturalMoves = [];
        if(this.getColor() == W){
            const square = gameBoard.getSquarefromBoard(row + 1, col);
            
            if(!square.isOccupied){
                if(row == 2)naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row + 2, col)));
                naturalMoves.push(new Move(this, square));
            }
            
            
            for(let i = col -1; i <= col + 1; i += 2){
                if(i >= 1 && i <= 8){
                    const takeMove = new Move(this, gameBoard.getSquarefromBoard(row + 1, i));
                    if(takeMove.getSquare().occupant?.getColor() == B)naturalMoves.push(takeMove)
                }
            }
        }
        if(this.getColor() == B){
            const square = gameBoard.getSquarefromBoard(row - 1, col)
           
            if(!square.isOccupied){
                 if(row == 7)naturalMoves.push(new Move(this, gameBoard.getSquarefromBoard(row - 2, col)));
                naturalMoves.push(new Move(this, square))
            }
            
            for(let i = col - 1; i <= col + 1; i += 2){
                if(i >= 1 && i <= 8){
                    const takeMove = new Move(this, gameBoard.getSquarefromBoard(row - 1, i));
                    if(takeMove.getSquare().occupant?.getColor() == W)naturalMoves.push(takeMove)
                
                }
            }
        }
        return naturalMoves;
    }
}

// *********GAME********* //
/////////////////////////////////////////////
class Game {

    constructor(){
        this.inBoardPieces = {};
        this.possibleMovesCentral = [];
        this._initalizePieces();
        this.currentPlayer = W;
        flipBtn.addEventListener("click", this._flipBoard);
    }
    
    start(){
        this._setInitMoves();
        this.updateUI(gameBoard.getBoard());
        this._activateBoard();
        this._activateDragandDrop();
    }
    _initalizePieces(){
        // INIT WHITE PIECES
        this.inBoardPieces.whiteQueen = new Queen(W);
        this.inBoardPieces.whiteKing = new King(W);
        this.inBoardPieces.whiteKingSideRook = new Rook(W, KS);
        this.inBoardPieces.whiteKingSideBishop = new Bishop(W, KS);
        this.inBoardPieces.whiteKingSideKnight = new Knight(W, KS);
        this.inBoardPieces.whiteQueenSideRook = new Rook(W, QS);
        this.inBoardPieces.whiteQueenSideBishop = new Bishop(W, QS);
        this.inBoardPieces.whiteQueenSideKnight = new Knight(W, QS);
        this.inBoardPieces.whitePawn1 = new Pawn(W, 1);
        this.inBoardPieces.whitePawn2 = new Pawn(W, 2);
        this.inBoardPieces.whitePawn3 = new Pawn(W, 3);
        this.inBoardPieces.whitePawn4 = new Pawn(W, 4);
        this.inBoardPieces.whitePawn5 = new Pawn(W, 5);
        this.inBoardPieces.whitePawn6 = new Pawn(W, 6);
        this.inBoardPieces.whitePawn7 = new Pawn(W, 7);
        this.inBoardPieces.whitePawn8 = new Pawn(W, 8);

        // INIT BLACK PIECES
        this.inBoardPieces.blackQueen = new Queen(B);
        this.inBoardPieces.blackKing = new King(B);
        this.inBoardPieces.blackKingSideRook = new Rook(B, KS);
        this.inBoardPieces.blackKingSideBishop = new Bishop(B, KS);
        this.inBoardPieces.blackKingSideKnight = new Knight(B, KS);
        this.inBoardPieces.blackQueenSideRook = new Rook(B, QS);
        this.inBoardPieces.blackQueenSideBishop = new Bishop(B, QS);
        this.inBoardPieces.blackQueenSideKnight = new Knight(B, QS);
        this.inBoardPieces.blackPawn1 = new Pawn(B, 1);
        this.inBoardPieces.blackPawn2 = new Pawn(B, 2);
        this.inBoardPieces.blackPawn3 = new Pawn(B, 3);
        this.inBoardPieces.blackPawn4 = new Pawn(B, 4);
        this.inBoardPieces.blackPawn5 = new Pawn(B, 5);
        this.inBoardPieces.blackPawn6 = new Pawn(B, 6);
        this.inBoardPieces.blackPawn7 = new Pawn(B, 7);
        this.inBoardPieces.blackPawn8 = new Pawn(B, 8);
    }
    _setInitMoves () {
        Object.entries(this.inBoardPieces).forEach(([id,piece]) => {
            piece.setId(id);
            piece.getInitMove().makeMove(false, true);
        })
    }
    updateUI(gameBoard) {
        visualBoard.innerHTML = "";
        gameBoard.forEach((sqr, i) =>{
            const squareColor = () => {
                let x = ["dark", "light"];
                // I AM NOT PROUD OF THIS LINE
                if(
                    ((i >= 0) && i <= 7) || 
                    ((i >= 16) && i <= 23) ||
                    ((i >= 32) && i <= 39) ||
                    ((i >= 48) && i <= 55)){
                    return i % 2 == 0? x[0] : x[1]
                }else{
                    return i % 2 == 0? x[1] : x[0]
                }
            }

            let html;
            if(sqr.isOccupied){
                html = `
                <div class="square ${squareColor()}" data-id="[${sqr.getSquareArr()}]">
                    <img id="${sqr.occupant.id}" src="img/${sqr.occupant.getColor()}_${names[sqr.occupant.getType()]}_png_shadow_128px.png">
                </div>`
            }
            else{
            html = `<div class="square ${squareColor()}" data-id="[${sqr.getSquareArr()}]"></div>`
            }
        visualBoard.insertAdjacentHTML("beforeend", html)

        });
    }
    _visualClear() {
        const activeSqr = visualBoard.querySelectorAll(".active-square");
        activeSqr.forEach(s => s.classList.remove("active-square"))
    }

    _switchPlayer() {
        this.currentPlayer == W? this.currentPlayer = B: this.currentPlayer = W;


    }

    _activateBoard() {
        let activeMoves = [];

        visualBoard.addEventListener("click", (e) => {
            const clicked = e.target.closest(".square");
            if(!clicked) return;
            const sqrArr = JSON.parse(clicked.dataset.id);
            const clickedSquare = gameBoard.getSquarefromBoard(...sqrArr);
            
            if(clicked.classList.contains("active-square")){
                const moveTosqr = JSON.parse(clicked.dataset.id);
                const moveTo = activeMoves.find(mov => mov.getSquare().equals(moveTosqr))
                moveTo.makeMove();

                // FAST
                moveTo.makeMoveUI();
                // SLOW
                // this.updateUI(gameBoard.getBoard());
                this._switchPlayer();

                if(!moveTo.isCastle){
                    this.checkValidation();
                    if(this.checkValidation()[1]){
                        console.log(this._checkMateValidation())
                    }
                }
                

            }else if(clickedSquare.isOccupied){
                this._visualClear()
                if(clickedSquare.occupant.getColor() == this.currentPlayer){
                activeMoves = clickedSquare.occupant.getPossibleMoves();
                this._renderPossibleMoves(activeMoves);
                // this._visualClear()
                }
            }else{
               this._visualClear()
            }
        })
    }
    _renderPossibleMoves(movesArr) {
        movesArr.forEach(move => {
            const moveSqr = visualBoard.querySelector(`[data-id="[${move.getSquare().getSquareArr()}]"]`);
            moveSqr.classList.add("active-square")
        });
    }

    _flipBoard() {
        body.classList.toggle("black-playing");
        body.classList.toggle("white-playing");
    }

    _activateDragandDrop() {
        // NON-DOM BUSINESS
        const generateMove = function(pieceId, squareData) {
            const [row, col] = JSON.parse(squareData);
            const piece = game.inBoardPieces[pieceId];
            const square = gameBoard.getSquarefromBoard(row, col);

            const move = piece.getPossibleMoves().find(move => move.equals(new Move(piece, square)))
            return move;
        }

        // DOM BUSINESS
        
        // DROP OBJECT
        const pieces = visualBoard.querySelectorAll("img");
        pieces.forEach(piece => {
            piece.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("piece", e.target.id);
            })
        })


        // RECIEVE OBJECT
        const squares = visualBoard.querySelectorAll("div");
        squares.forEach(square => {
            square.addEventListener("dragover", e => e.preventDefault());
            square.addEventListener("drop", (e) => {
                const pieceId = e.dataTransfer.getData("piece");
                if(!pieceId) return;

                const move = generateMove(pieceId ,square.dataset.id);
                if(move && move.getPiece().getColor() == this.currentPlayer){
                    move.makeMove();
                    move.makeMoveUI();
                    this._switchPlayer();
                    if(!move.isCastle){
                        this.checkValidation();
                        if(this.checkValidation()[1]){
                            console.log(this._checkMateValidation())
                        }
                    }
                }

            })
        })
    }



    checkValidation() {
        let king;
        let check = false;

        const globalPossibleMoves = _ =>  {
            return Object.entries(this.inBoardPieces).flatMap(([id,piece]) => piece.getPossibleMoves());
        }
        const globalEndangeredMoves = possibleMoves => {
            return possibleMoves.map(move => move.getSquare().getSquareArr());
        }

        const possibleMoves = globalPossibleMoves()

        const endangeredSquares = globalEndangeredMoves(possibleMoves)
        
        if(endangeredSquares.some(square => this.inBoardPieces.blackKing.getPosition().equals(square))){
            king = B;
            check = true;

        }
        if(endangeredSquares.some(square => this.inBoardPieces.whiteKing.getPosition().equals(square))){
            king = W;
            check = true;
        }

        return [king, check]
    }

    _checkMateValidation() {

        const globalPossibleMoves = _ =>  {
            return Object.entries(this.inBoardPieces).flatMap(([id,piece]) => piece.getPossibleMoves());
        }
        let [color, _] = game.checkValidation();
        let possibleMoves = globalPossibleMoves();
        possibleMoves = possibleMoves.filter(move => move.getPiece().getColor() == color);

        const mate = possibleMoves.every(move => {
            let check = false;
            
            move.makeMove(true);
            [color, check] = game.checkValidation();
            move.undoMove();

            return check;
        });
        return mate;
    }

    gameOver(color) {
        console.log(`${color == W? "White" : "Black"} wins`)
    }
}

const game = new Game()
game.start();

