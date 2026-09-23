(function(g){
"use strict";
var LIB=[
{id:"PS23",book:"Psalms",ref:"Psalm 23:1",text:"The Lord is my shepherd; I shall not want."},
{id:"PS27",book:"Psalms",ref:"Psalm 27:1",text:"The Lord is my light and my salvation; whom shall I fear?"},
{id:"PS46",book:"Psalms",ref:"Psalm 46:1",text:"God is our refuge and strength, a very present help in trouble."},
{id:"PS121",book:"Psalms",ref:"Psalm 121:7-8",text:"The Lord shall preserve thee from all evil: he shall preserve thy soul. The Lord shall preserve thy going out and thy coming in from this time forth, and even for evermore."},
{id:"PR3",book:"Proverbs",ref:"Proverbs 3:5-6",text:"Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."},
{id:"IS41",book:"Isaiah",ref:"Isaiah 41:10",text:"Fear thou not; for I am with thee: be not dismayed; for I am thy God."},
{id:"MT5",book:"Matthew",ref:"Matthew 5:9",text:"Blessed are the peacemakers: for they shall be called the children of God."},
{id:"MT6",book:"Matthew",ref:"Matthew 6:9-10",text:"Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done in earth, as it is in heaven."},
{id:"JN1",book:"John",ref:"John 1:5",text:"And the light shineth in darkness; and the darkness comprehended it not."},
{id:"JN14",book:"John",ref:"John 14:27",text:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid."},
{id:"RO8",book:"Romans",ref:"Romans 8:28",text:"And we know that all things work together for good to them that love God."},
{id:"RO15",book:"Romans",ref:"Romans 15:13",text:"Now the God of hope fill you with all joy and peace in believing."},
{id:"EPH3",book:"Ephesians",ref:"Ephesians 3:20-21",text:"Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us, unto him be glory."},
{id:"EPH6",book:"Ephesians",ref:"Ephesians 6:10",text:"Finally, my brethren, be strong in the Lord, and in the power of his might."},
{id:"PHP4",book:"Philippians",ref:"Philippians 4:7",text:"And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus."}
];
var i=0;
g.CHIROMBE_SCRIPTURE={list:LIB,next:function(){var x=LIB[i%LIB.length];i++;return x},byId:function(id){return LIB.filter(function(x){return x.id===id})[0]||null}};
})(typeof window!=="undefined"?window:globalThis);
